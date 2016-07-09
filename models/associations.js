'use strict'

module.exports = function(models, logger) {
	logger.info('Setting up model associations')

	let {
		Worker,
		GenomeQueue,
		Genome,
		WorkerModule
	} = models

	Worker.hasMany(GenomeQueue)
	Worker.hasMany(WorkerModule)

	GenomeQueue.belongsTo(Worker)

	Genome.hasMany(WorkerModule)

	WorkerModule.belongsTo(Worker)
	WorkerModule.belongsTo(Genome)
}
