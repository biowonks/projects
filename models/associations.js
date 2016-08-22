'use strict'

module.exports = function(models, optLogger) {
	if (optLogger)
		optLogger.info('Setting up model associations')

	let {
		Worker,
		Genome,
		WorkerModule,
		Component,
		Gene,
		Aseq,
		Dseq
	} = models

	Worker.hasMany(WorkerModule)

	Genome.hasMany(WorkerModule)
	Genome.belongsTo(Worker)

	Genome.hasMany(Component)
	Component.belongsTo(Genome)

	WorkerModule.belongsTo(Worker)
	WorkerModule.belongsTo(Genome)

	Component.hasMany(Gene)
	Gene.belongsTo(Component)

	Gene.belongsTo(Aseq)
	Gene.belongsTo(Dseq)

	Aseq.hasMany(Gene)
	Dseq.hasMany(Gene)
}
