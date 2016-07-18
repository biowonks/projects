#!/usr/bin/env node

'use strict'

// Local
const BootService = require('../services/BootService')

let bootService = new BootService()

bootService.setup()
.then(() => {
	let sequelize = bootService.sequelize(),
		models = bootService.models()

	bootService.logger().info('Clearing all worker_modules with errors and releasing stale genomes')
	return sequelize.transaction((transaction) => {
		return models.WorkerModule.destroy({
			where: {
				state: 'error'
			},
			transaction
		})
		.then(() => sequelize.query(`UPDATE ${models.Genome.getTableName()}
			SET worker_id = NULL
			WHERE worker_id IN (
				SELECT id
				FROM ${models.Worker.getTableName()}
				WHERE active = false AND normal_exit = false
			)`, {transaction})
		)
	})
	.then(() => {
		bootService.logger().info('All done')
	})
})
