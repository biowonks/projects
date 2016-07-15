'use strict'

module.exports = function(models, optLogger) {
	if (optLogger)
		optLogger.info('Setting up model associations')

	let {
		Worker,
		Genome,
		WorkerModule
	} = models

	Worker.hasMany(WorkerModule)

	Genome.hasMany(WorkerModule)
	Genome.belongsTo(Worker)

	WorkerModule.belongsTo(Worker)
	WorkerModule.belongsTo(Genome)
}
