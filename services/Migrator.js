'use strict'

// Vendor
let Umzug = require('umzug')

/**
 * Migrator facilitates running and reverting migrations.
 */
module.exports =
class Migrator {
	/**
	 * If the umzug storage is 'sequelize', then configures the migration function calls
	 * with the sequelize query interface and DataTypes arguments.
	 *
	 * @constructor
	 * @param {object} sequelize configured instance of the sequelize library
	 * @param {object} umzugOptions defaults to an empty object
	 * @param {object} optLogger defaults to null
	 */
	constructor(sequelize, umzugOptions = {}, optLogger = null) {
		// Assign sequelize instance to the umzug engine if relevant
		if (umzugOptions.storage === 'sequelize') {
			let queryInterface = sequelize.getQueryInterface(),
				DataTypes = sequelize.constructor

			umzugOptions.storageOptions.sequelize = sequelize
			umzugOptions.migrations.params = [queryInterface, DataTypes]
		}

		this.umzug_ = new Umzug(umzugOptions)
		this.logger_ = optLogger
	}

	/**
	 * Runs all pending migrations if there any.
	 *
	 * @returns {Promise}
	 */
	up() {
		return this.umzug_.pending()
		.then((migrations) => {
			if (!migrations.length)
				return null

			this.log_('info', `${migrations.length} migrations pending`)

			return this.umzug_.up()
			.then((finishedMigrations) => {
				finishedMigrations.forEach((migration) => {
					this.log_('info', {sqlFile: migration.file}, `  >> ${migration.file}`)
				})

				this.log_('info', 'Migrations complete')
			})
			.catch((error) => {
				this.log_('fatal', `Unable to perform migrations: ${error.message}`)
				throw error
			})
		})
	}

	/**
	 * Reverts the last executed migration.
	 *
	 * @returns {Promise}
	 */
	down() {
		return this.umzug_.down()
		.then((migrations) => {
			if (!migrations.length)
				this.log_('info', 'No migrations found')

			migrations.forEach((migration) => {
				this.log_('info', `Reverted migration: ${migration.file}`)
			})
		})
		.catch((error) => {
			this.log_('fatal', {error}, 'Unable to undo the last migration')
			throw error
		})
	}

	// ----------------------------------------------------
	// Private methods
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
}
