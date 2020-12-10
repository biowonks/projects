'use strict';

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule');
const IdService = require('mist-lib/services/IdService');
const GeneClusterFinderService = require('mist-lib/services/GeneClusterFinder');

module.exports =
class GeneClusters extends PerGenomePipelineModule {
  static description() {
    return 'predicts chromosomal gene clusters';
  }

  static dependencies() {
    return ['NCBICoreData'];
  }

  constructor(app, genome) {
    super(app, genome);

    this.idService_ = new IdService(this.models_.IdSequence, this.logger_);
    this.GeneCluster_ = this.models_.GeneCluster;
    this.GeneClusterMember_ = this.models_.GeneClusterMember;
    this.clusterFinder_ = new GeneClusterFinderService();
    this.geneClusterRecords_ = [];
  }

  optimize() {
    return this.analyze(
      this.GeneCluster_.getTableName(),
      this.GeneClusterMember_.getTableName(),
    );
  }

  undo() {
    return this.sequelize_.transaction({
      isolationLevel: 'READ COMMITTED',
    }, async (transaction) => {
      this.logger_.info('Deleting genome genes_clusters');
      const components = await this.genome_.getComponents({
        attributes: ['id'],
        transaction,
      });
      const componentIds = components.map((component) => component.id);
      await this.GeneCluster_.destroy({
        where: {
          component_id: componentIds,
        },
        transaction,
      });
    });
  }

  async run() {
    const components = await this.getComponents_();
    this.logger_.info(`Preparing to predict clusters for ${components.length} components`);
    for (const component of components) {
      await this.findClustersInComponent_(component);
    }
    await this.saveClusters_();
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
        'length',
      ],
    });
  }

  /**
	 * Retrieves the genes for ${component} and predicts gene clusters which are stored in memory.
	 *
	 * @param {Component} component
	 * @returns {Promise}
	 */
  async findClustersInComponent_(component) {
    const genes = await this.getGenes_(component);
    let clusters = this.clusterFinder_.findClusters(genes, {
      isCircular: component.is_circular,
      repliconLength: component.length,
    });

    clusters.forEach((cluster) => {
      this.geneClusterRecords_.push({
        component_id: component.id,
        strand: cluster[0].strand,
        size: cluster.length,
        $genes: cluster, // temporarily store the individual genes with each cluster record
      });
    });
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
        'strand',
      ],
    });
  }

  /**
	 * Two step process that leverages bulkCreate for performance purposes:
	 * 1) bulk create all gene cluster records
	 * 2) map the newly created gene cluster ids to the child gene cluster members records
	 * 3) bulk create all gene cluster members
	 *
	 * @returns {Promise}
	 */
  async saveClusters_() {
    const geneClusterRecords = this.geneClusterRecords_;
    this.logger_.info(`Saving ${geneClusterRecords.length} gene clusters`);
    await this.idService_.assignIds(geneClusterRecords, this.GeneCluster_);
    const members = this.extractMemberRecords_(geneClusterRecords);
    return this.sequelize_.transaction(async (transaction) => {
      this.logger_.info(`Inserting ${geneClusterRecords.length} gene clusters and ${members.length} gene members`);
      await this.GeneCluster_.bulkCreate(geneClusterRecords, {
        validate: true,
        transaction,
      });
      await this.GeneClusterMember_.bulkCreate(members, {
        validate: true,
        transaction,
        returning: false,
      });
    });
  }

  /**
	 * Transfers the relevant gene cluster identifiers to the gene cluster member record.
	 *
	 * @param {Array.<GeneCluster>} geneClusters
	 * @returns {Array.<Object>} - array of gene cluster member records
	 */
  extractMemberRecords_(geneClusters) {
    const members = [];
    this.geneClusterRecords_.forEach((cluster, i) => {
      const geneCluster = geneClusters[i];
      cluster.$genes.forEach((gene) => {
        members.push({
          genes_cluster_id: geneCluster.id,
          gene_id: gene.id,
        });
      });
    });
    return members;
  }
};
