'use strict'

module.exports = function(models, logger) {
	logger.info('Setting up model associations')

	let {
		Worker,
		GenomeQueue
	} = models

	Worker.hasMany(GenomeQueue)
	GenomeQueue.hasOne(Worker)
}
