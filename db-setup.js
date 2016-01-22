'use strict'

let Umzug = require('umzug'),
	Promise = require('bluebird'),
	Sequelize = require('sequelize')

module.exports = function(config, logger) {
	if (!config)
		return Promise.reject('Unable to setup database: missing configuration');

	if (!logger)
		return Promise.reject('Unable to setup database: missing logger');

	let dbConfig = config.database;
	if (!dbConfig)
		return Promise.reject('Unable to setup database: config.database is not valid');

	if (!dbConfig.enabled)
		return Promise.resolve();

	logger.info('Validating database connection');

	if (!dbConfig.name) {
		logger.fatal('Invalid database configuration: missing database name');
		return Promise.reject(new Error('Database enabled, but missing configuration (name)'));
	}

	let sequelize,
		umzug;

	try {
		sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, dbConfig.sequelizeOptions);
	}
	catch (error) {
		return Promise.reject(error);
	}

	return sequelize.authenticate()
	.catch(function(error) {
		logger.fatal('Unable to authenticate with database: ' + error.message);
		throw error;
	})
	.then(function() {
		logger.info('Successfully connected to database');

		let options = config.migrations.umzug;

		// Assign sequelize instance to the umzug engine if relevant
		if (options.storage === 'sequelize') {
			let DataTypes = sequelize.constructor,
				migration = sequelize.getQueryInterface();

			options.storageOptions.sequelize = sequelize;
			options.migrations.params = [migration, DataTypes];
		}

		umzug = new Umzug(options);
		return umzug.pending();
	})
	.then(function(migrations) {
		if (!migrations.length)
			return sequelize;

		logger.info('Running migrations');

		return umzug.up()
		.then(function(finishedMigrations) {
			finishedMigrations.forEach(function(migration) {
				logger.info({sqlFile: migration.file}, '  >> ' + migration.file);
			});

			logger.info('Migrations complete');

			return sequelize;
		})
		.catch(function(error) {
			logger.fatal('Unable to perform migrations: ' + error.message);
			throw error;
		});
	});
}
