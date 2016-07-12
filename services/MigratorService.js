'use strict'

// Core
const assert = require('assert'),
	fs = require('fs'),
	path = require('path')

// Vendor
const Promise = require('bluebird'),
	Sequelize = require('sequelize')

// Local
const arrayUtil = require('../pipeline/lib/array-util'),
	migrationSqlParser = require('./migration-sql-parser')

// Constants
const kSavePointName = 'migrations',
	kDefaults = {
		pattern: /^\d{14}_\d{4}_[\w-_]+\.sql$/,
		modelName: 'MigrationMeta',
		tableName: 'migrations_meta'
	}

// Other
let readdir = Promise.promisify(fs.readdir),
	readFile = Promise.promisify(fs.readFile)

/**
 * Migrator facilitates running and reverting migrations safely. Migrations are stored locally on
 * the filesystem. Migrations that have been executed are stored inside a PostgreSQL database table.
 * To prevent race conditions between multiple instances attempting to run the same migrations
 * simultaneously, an exclusive lock is obtained on the migrations meta table until all migrations
 * have been processed.
 *
 * All migrations are executed within a single transaction that includes the migrations table lock.
 * If a migration fails, all previous migrations are persisted (accomplished by using SAVEPOINTs).
 */
module.exports =
class MigratorService {
	/**
	 * If the umzug storage is 'sequelize', then configures the migration function calls
	 * with the sequelize query interface and DataTypes arguments.
	 *
	 * @constructor
	 * @param {Object} sequelize - configured instance of the sequelize library
	 * @param {Object} options
	 * @param {String} options.path - local path where migration files are stored
	 * @param {RegExp} [options.pattern=/^\d{14}_\d{4}_[\w-_]+\.sql$/] - only consider files in ${options.path} that match this pattern as migration files
	 * @param {String} [options.modelName='MigrationMeta'] - name of sequelize model
	 * @param {String} [options.tableName='migrations_meta'] - database table where migrations are stored
	 * @param {String} [options.schema='public']
	 * @param {Object} [options.logger=null] - bunyan logger instance
	 */
	constructor(sequelize, options = {}) {
		assert(sequelize, 'sequelize argument is required')
		assert(options.path, 'options.path argument is required')

		this.sequelize_ = sequelize
		this.migrationFilePath_ = options.path
		this.migrationFilePattern_ = options.pattern || kDefaults.pattern
		this.modelName_ = options.modelName || kDefaults.modelName
		this.tableName_ = options.tableName || kDefaults.tableName
		this.schema_ = options.schema || 'public'
		this.logger_ = options.logger

		this.migrationFiles_ = null
		this.model_ = this.createModel_()
	}

	/**
	 * Runs all pending migrations. Creates the migration table if it does not already exist, and
	 * exclusively locks the migrations table so that only a single instance may run migrations at a
	 * given time.
	 *
	 * @returns {Promise.<Array.<String>>} - array of migration file names that were executed
	 */
	up() {
		return this.ensureTableExists_()
		.then(() => this.sequelize_.transaction((transaction) => {
			return this.lockTable_(transaction)
			.then(this.pending.bind(this, transaction))
			.then((pendingMigrations) => {
				let numPending = pendingMigrations.length
				if (numPending === 0) {
					this.log_('info', 'No migrations are pending')
					return null
				}

				this.log_('info', `${numPending} pending migration(s)`)
				return this.migrationsUp_(pendingMigrations, transaction)
				.then(() => {
					this.log_('info', 'Migrations complete')
				})
				.catch((error) => {
					this.log_('fatal', {error}, `Unable to perform the last migration: ${error.message}`)
					throw error
				})
			})
		}))
	}

	/**
	 * Undoes ${optAmount} migrations in reverse order that they were executed.
	 *
	 * @param {Number} [optAmount=1] - number of migrations to rollback
	 * @returns {Promise.<Array.<String>>}
	 */
	down(optAmount = 1) {
		return this.ensureTableExists_()
		.then(() => this.sequelize_.transaction((transaction) => {
			return this.lockTable_(transaction)
			.then(this.recentlyExecuted.bind(this, optAmount, transaction))
			.then((migrationsToUndo) => {
				let numToUndo = migrationsToUndo.length
				if (numToUndo === 0) {
					this.log_('info', 'No migrations found')
					return null
				}

				this.log_('info', `Preparing to undo ${numToUndo} migration(s)`)
				migrationsToUndo.reverse()
				return this.migrationsDown_(migrationsToUndo, transaction)
				.then(() => {
					this.log_('info', 'Rollback complete')
				})
				.catch((error) => {
					this.log_('fatal', {error}, `Unable to undo the last migration: ${error.message}`)
					throw error
				})
			})
		}))
	}

	/**
	 * @returns {Promise.<Array.<String>>} - lexically sorted list of matching migration files
	 */
	migrationFiles() {
		if (this.migrationFiles_)
			return Promise.resolve(this.migrationFiles_)

		return readdir(this.migrationFilePath_, 'utf8')
		.then((files) => files.filter((x) => this.migrationFilePattern_.test(x)).sort())
	}

	/**
	 * @returns {Model} - sequelize migration model
	 */
	model() {
		return this.model_
	}

	/**
	 * @param {Transaction} [optTransaction]
	 * @returns {Promise.<Array.<Model>>} - ordered array of migration instances that have been executed
	 */
	executed(optTransaction) {
		return this.model_.findAll({
			order: [
				['id', 'ASC']
			],
			attributes: ['id', 'name'],
			transaction: optTransaction
		})
	}

	/**
	 * @param {Number} [optAmount=1] number of transactions to undo
	 * @param {Transaction} [optTransaction]
	 * @returns {Promise.<Array.<Model>>}
	 */
	recentlyExecuted(optAmount = 1, optTransaction = null) {
		let amount = Math.max(1, optAmount)
		return this.executed(optTransaction)
		.then((executedMigrations) => executedMigrations.slice(-amount))
	}

	/**
	 * @param {Transaction} [optTransaction]
	 * @returns {Promise.<Array.<Model>>} - ordered array of migration instances that have not yet been executed
	 */
	pending(optTransaction) {
		return Promise.all([
			this.migrationFiles(),
			this.executed(optTransaction)
		])
		.spread((migrationFiles, executedMigrations) => {
			let executedFileNames = executedMigrations.map((x) => x.name),
				pendingMigrationFileNames = arrayUtil.difference(migrationFiles, executedFileNames)
			pendingMigrationFileNames.sort()
			let pendingMigrations = pendingMigrationFileNames.map((x) => this.model_.build({name: x}))
			return pendingMigrations
		})
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * @returns {Model}
	 */
	createModel_() {
		let fields = {
				name: {
					type: Sequelize.TEXT,
					allowNull: false,
					unique: true
				}
			},
			params = {
				tableName: this.tableName_,
				schema: this.schema_,
				charset: 'utf8',
				timestamps: true,
				updatedAt: false
			}

		return this.sequelize_.define(this.modelName_, fields, params)
	}

	/**
	 * @returns {Promise}
	 */
	ensureTableExists_() {
		return this.model_.sync()
	}

	/**
	 * @param {Transaction} transaction
	 * @returns {Promise}
	 */
	lockTable_(transaction) {
		return this.sequelize_.query(`LOCK TABLE ${this.tableName_} IN ACCESS EXCLUSIVE MODE`,
			{raw: true, transaction})
	}

	/**
	 * Convenience method for logging a message if a logger is defined.
	 *
	 * @param {string} method the bunyan logger method call (e.g. 'info')
	 * @param {...*} params arguments to pass to the logger
	 */
	log_(method, ...params) {
		if (this.logger_)
			this.logger_[method](...params)
	}

	/**
	 * @param {Array.<String>} migrations - list of migration file names to perform
	 * @param {Transaction} transaction - sequelize transaction
	 * @returns {Promise.<Array.<Model>>} - list of executed transactions
	 */
	migrationsUp_(migrations, transaction) {
		return Promise.each(migrations, (migration) => {
			this.log_('info', {fileName: migration.name}, `  >> ${migration.name}`)

			return this.parseMigration_(migration.name)
			.then((migrationSql) => {
				let sql = migrationSql.up
				if (!sql)
					throw new Error(`cannot run migration, ${migration.name}: missing 'up' SQL`)

				return this.savePoint_(transaction)
				.then(() => this.sequelize_.query(sql, {raw: true, transaction}))
				.catch((error) => {
					return this.rollbackToSavePoint_(transaction)
					.then(() => transaction.commit())
					.then(() => {
						throw error
					})
				})
				.then(() => this.releaseSavePoint_(transaction))
			})
			.then(() => migration.save({transaction}))
		})
		.then(() => migrations)
	}

	/**
	 * @param {Array.<String>} migrations - list of migration file names to perform
	 * @param {Transaction} transaction - sequelize transaction
	 * @returns {Promise.<Array.<Model>>} - list of executed transactions
	 */
	migrationsDown_(migrations, transaction) {
		return Promise.each(migrations, (migration) => {
			this.log_('info', {fileName: migration.name}, `  << Reverting ${migration.name}`)

			return this.parseMigration_(migration.name)
			.then((migrationSql) => {
				let sql = migrationSql.down
				if (!sql)
					throw new Error(`cannot run migration, ${migration.name}: missing 'down' SQL`)

				return this.savePoint_(transaction)
				.then(() => this.sequelize_.query(sql, {raw: true, transaction}))
				.catch((error) => {
					return this.rollbackToSavePoint_(transaction)
					.then(() => transaction.commit())
					.then(() => {
						throw error
					})
				})
				.then(() => this.releaseSavePoint_(transaction))
			})
			.then(() => migration.destroy({transaction}))
		})
		.then(() => migrations)
	}

	/**
	 * @param {String} migrationFileName
	 * @returns {Promise.<Object>} - migration sql split into up / down SQL chunks
	 */
	parseMigration_(migrationFileName) {
		let migrationFile = path.resolve(this.migrationFilePath_, migrationFileName)
		return readFile(migrationFile, 'utf8')
		.then((sql) => {
			return migrationSqlParser.parse(sql)
		})
	}

	/**
	 * @param {Transaction} transaction
	 * @returns {Promise}
	 */
	savePoint_(transaction) {
		return this.sequelize_.query(`SAVEPOINT ${kSavePointName}`, {raw: true, transaction})
	}

	/**
	 * @param {Transaction} transaction
	 * @returns {Promise}
	 */
	releaseSavePoint_(transaction) {
		return this.sequelize_.query(`RELEASE SAVEPOINT ${kSavePointName}`, {raw: true, transaction})
	}

	/**
	 * @param {Transaction} transaction
	 * @returns {Promise}
	 */
	rollbackToSavePoint_(transaction) {
		return this.sequelize_.query(`ROLLBACK TO SAVEPOINT ${kSavePointName}`, {raw: true, transaction})
	}
}
