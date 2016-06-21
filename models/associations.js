'use strict'

module.exports = function(models, logger) {
	logger.info('Setting up model associations')

	models.Worker.hasMany(models.GenomesQueue)
	models.GenomesQueue.hasOne(models.Worker)
}
