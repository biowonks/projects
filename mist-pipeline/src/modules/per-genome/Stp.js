'use strict'

// Local
const AseqCompute = require('./AseqCompute')
const StpToolRunner = require('lib/services/AseqsComputeService/tool-runners/StpToolRunner')

module.exports =
class Stp extends AseqCompute {
  static description() {
    return 'signal transduction protein identification'
  }

  static subModuleMap() {
    // Empty map object denotes no submodules
    return new Map()
  }

  static dependencies() {
    return [
      ...super.dependencies(),
      'AseqCompute:pfam31',
      'AseqCompute:agfam2',
      'AseqCompute:ecf1',
    ]
  }

  constructor(app, genome) {
    super(app, genome, [StpToolRunner.meta.id])
    this.version_ = app.config.toolRunners[StpToolRunner.meta.id].version
  }

  undo() {
    this.logger_.info(`Deleting this genome's ${this.models_.SignalGene.getTableName()}`)
		return this.sequelize_.transaction({
			isolationLevel: 'READ COMMITTED'
		}, (transaction) => {
      return this.deleteSignalGenes_(transaction)
      .then(() => this.nullStpForWrongVersion_(transaction))
		})
  }

  afterSave(transaction) {
    const { Aseq, Component, Gene, SignalGene } = this.models_
    const componentTableName = Component.getTableName()
    const geneTableName = Gene.getTableName()
    const signalGeneTableName = SignalGene.getTableName()
    const aseqTableName = Aseq.getTableName()

    const sql = `
      INSERT INTO ${signalGeneTableName} (
        gene_id,
        component_id,
        signal_domains_version,
        ranks,
        counts,
        inputs,
        outputs,
        data
      )
      SELECT
        b.id as gene_id,
        component_id,
        ${this.version_} as signal_domains_version,
        array(select jsonb_array_elements_text(stp->'ranks')),
        stp->'counts',
        array(select jsonb_array_elements_text(stp->'inputs')),
        array(select jsonb_array_elements_text(stp->'outputs')),
        case when stp->'cheHits' is not null then jsonb_set('{}', '{cheHits}', stp->'cheHits') else '{}' end
      FROM ${componentTableName} a JOIN ${geneTableName} b ON (a.id = b.component_id)
        JOIN ${aseqTableName} c ON (b.aseq_id = c.id)
      WHERE a.genome_id = ? AND stp is not null AND stp->'ranks'->0 is not null
    `
    return this.sequelize_.query(sql, {
      plain: true,
      raw: true,
      replacements: [this.genome_.id],
      transaction,
    })
  }

  afterRun() {
    return this.models_.SignalGene.count({
      include: {
        model: this.models_.Component,
        required: true,
        where: {
          genome_id: this.genome_.id,
        },
      },
    })
    .then((numSignalGenes) => {
      this.logger_.info({numSignalGenes}, `Identified ${numSignalGenes} signaling genes`)
    })
  }

  /**
   * Re-run aseqs with Stp data if the version to execute is different than the currently configured
   * version.
   */
  alternateAseqsMissingDataCondition() {
    return `stp is not null AND stp->'version' != '${this.version_}'`
  }

  // Return Stp
  workerModuleRecords() {
    return [this.newWorkerModuleData()]
  }

	// ----------------------------------------------------
	// Private methods
  deleteSignalGenes_(transaction) {
    return this.genome_.getComponents({
      attributes: ['id'],
      transaction,
    })
    .then((components) => {
      const componentIds = components.map((component) => component.id)
      return this.models_.SignalGene.destroy({
        where: {
          component_id: componentIds,
        },
        transaction,
      })
    })
  }

  /**
   * The idea is to set the aseqs.stp field to null for those aseqs belonging to this genome
   * that have a non-null value for stp and their stp->'version' is set to the current version
   * @param {Transaction} transaction
   */
  nullStpForWrongVersion_(transaction) {
    const aseqTableName = this.models_.Aseq.getTableName()
    const componentTableName = this.models_.Component.getTableName()
    const geneTableName = this.models_.Gene.getTableName()

    const sql = `
      UPDATE ${aseqTableName}
      SET stp = NULL
      FROM ${componentTableName} JOIN ${geneTableName} ON (${componentTableName}.id = ${geneTableName}.component_id)
      WHERE ${componentTableName}.genome_id = ? AND
        ${aseqTableName}.id = ${geneTableName}.aseq_id AND
        stp is not null AND
        stp->'version' = '${this.version_}'
    `
    return this.sequelize_.query(sql, {
      plain: true,
      raw: true,
      replacements: [this.genome_.id],
      transaction,
    })
  }
}
