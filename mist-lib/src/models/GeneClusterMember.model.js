'use strict'

module.exports = function(Sequelize, models, extras) {
	let fields = {
		genes_cluster_id: extras.requiredPositiveInteger(),
		gene_id: extras.requiredPositiveInteger()
	}

	return {
		fields,
		params: {
			noPrimaryKey: true,
			tableName: 'genes_clusters_members',
			timestamps: false
		}
	}
}
