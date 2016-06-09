'use strict'

// Vendor
let Umzug = require('umzug'),
	Promise = require('bluebird')

module.exports =
class Migrator {
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
	 * Run all pending migrations if there any.
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

	down() {
		return this.umzug_.down()
		.then((migration) => {
			this.log_('info', `Reverted last migration: ${migration.name}`)
		})
		.catch((error) => {
			this.log_('fatal', {error, stack: error.stack}, `Unable to undo migration: ${migration.name}`)
		})
	}

	log_(method, ...params) {
		if (this.logger_)
			this.logger_[method](...params)
	}
}
