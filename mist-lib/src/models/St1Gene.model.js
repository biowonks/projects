'use strict'

module.exports = function(Sequelize, models, extras) {
  const fields = {
    id: Object.assign(extras.requiredPositiveInteger(), {
      description: 'primary key; foreign identifier to source gene',
      primaryKey: true,
      example: 1,
    }),
		genome_id: Object.assign(extras.requiredPositiveInteger(), {
			description: 'foreign identifier to this gene\'s genome',
			example: 1
		}),
		component_id: Object.assign(extras.requiredPositiveInteger(), {
			description: 'foreign identifier to this gene\'s component',
			example: 1
		}),
  }

  return {
    fields,
    params: {
      timestamps: false,
    }
  }
}
