'use strict'

module.exports = function(models, logger) {
	logger.info('Setting up model associations')

	let {
		Worker,
		Genome,
		WorkerModule
	} = models

	Worker.hasMany(WorkerModule)

	Genome.hasMany(WorkerModule)

	WorkerModule.belongsTo(Worker)
	WorkerModule.belongsTo(Genome)
}
