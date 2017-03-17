'use strict'

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule'),
	IdService = require('mist-lib/services/IdService'),
	GeneClusterFinderService = require('mist-lib/services/GeneClusterFinder')

module.exports =
class GeneClusters extends PerGenomePipelineModule {
	static description() {
		return 'predicts chromosomal gene clusters'
	}

	static dependencies() {
		return ['NCBICoreData']
	}

	constructor(app, genome) {
		super(app, genome)

		this.idService_ = new IdService(this.models_.IdSequence, this.logger_)
		this.GeneCluster_ = this.models_.GeneCluster
		this.GeneClusterMember_ = this.models_.GeneClusterMember
		this.clusterFinder_ = new GeneClusterFinderService()
		this.geneClusterRecords_ = []
	}

	optimize() {
		return this.analyze(
			this.GeneCluster_.getTableName(),
			this.GeneClusterMember_.getTableName()
		)
	}

	undo() {
		this.logger_.info('Deleting genome genes_clusters')
		return this.genome_.getComponents({
			attributes: ['id']
		})
		.then((components) => {
			let componentIds = components.map((component) => component.id)
			return this.GeneCluster_.destroy({
				where: {
					component_id: componentIds
				}
			})
		})
	}

	run() {
		return this.getComponents_()
		.then((components) => {
			this.logger_.info(`Preparing to predict clusters for ${components.length} components`)
			return Promise.each(components, this.findClustersInComponent_.bind(this))
		})
		.then(this.saveClusters_.bind(this))
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * @returns {Promise.<Array.<Component>>}
	 */
	getComponents_() {
		return this.genome_.getComponents({
			attributes: [
				'id',
				'is_circular',
				'length'
			]
		})
	}

	/**
	 * Retrieves the genes for ${component} and predicts gene clusters which are stored in memory.
	 *
	 * @param {Component} component
	 * @returns {Promise}
	 */
	findClustersInComponent_(component) {
		return this.getGenes_(component)
		.then((genes) => {
			let clusters = this.clusterFinder_.findClusters(genes, {
				isCircular: component.is_circular,
				repliconLength: component.length
			})

			clusters.forEach((cluster) => {
				this.geneClusterRecords_.push({
					component_id: component.id,
					strand: cluster[0].strand,
					size: cluster.length,
					$genes: cluster // temporarily store the individual genes with each cluster record
				})
			})
		})
	}

	/**
	 * @param {Component} component
	 * @returns {Promise.<Array.<Gene>>} - genes belonging to ${component} and the necessary attributes to predict gene clusters
	 */
	getGenes_(component) {
		return component.getGenes({
			attributes: [
				'id',
				'start',
				'stop',
				'strand'
			]
		})
	}

	/**
	 * Two step process that leverages bulkCreate for performance purposes:
	 * 1) bulk create all gene cluster records
	 * 2) map the newly created gene cluster ids to the child gene cluster members records
	 * 3) bulk create all gene cluster members
	 *
	 * @returns {Promise}
	 */
	saveClusters_() {
		let geneClusterRecords = this.geneClusterRecords_,
			members = null
		this.logger_.info(`Saving ${geneClusterRecords.length} gene clusters`)
		return this.idService_.assignIds(geneClusterRecords, this.GeneCluster_)
		.then(() => {
			members = this.extractMemberRecords_(geneClusterRecords)
			return this.sequelize_.transaction((transaction) => {
				this.logger_.info(`Inserting ${geneClusterRecords.length} gene clusters and ${members.length} gene members`)
				return this.GeneCluster_.bulkCreate(geneClusterRecords, {
					validate: true,
					transaction
				})
				.then(() => this.GeneClusterMember_.bulkCreate(members, {
					validate: true,
					transaction
				}))
			})
		})
	}

	/**
	 * Transfers the relevant gene cluster identifiers to the gene cluster member record.
	 *
	 * @param {Array.<GeneCluster>} geneClusters
	 * @returns {Array.<Object>} - array of gene cluster member records
	 */
	extractMemberRecords_(geneClusters) {
		let members = []
		this.geneClusterRecords_.forEach((cluster, i) => {
			let geneCluster = geneClusters[i]
			cluster.$genes.forEach((gene) => {
				members.push({
					genes_cluster_id: geneCluster.id,
					gene_id: gene.id
				})
			})
		})
		return members
	}
}
