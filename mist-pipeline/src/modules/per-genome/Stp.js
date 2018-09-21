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
    this.version = app.config.toolRunners[StpToolRunner.meta.id].version
  }

  doRun(transaction) {
    return super.doRun(transaction)
    .then(() => {
      const { Aseq, Component, Gene, SignalGene } = this.models_
      const ComponentTableName = Component.getTableName()
      const GeneTableName = Gene.getTableName()
      const SignalGeneTableName = SignalGene.getTableName()
      const AseqTableName = Aseq.getTableName()

      const sql = `
        INSERT INTO ${SignalGeneTableName} (
          gene_id,
          component_id,
          signal_domains_version,
          ranks,
          counts,
          inputs,
          outputs
        )
        SELECT
          b.id as gene_id,
          component_id,
          ${this.version} as signal_domains_version,
          array(select jsonb_array_elements_text(stp->'ranks')),
          stp->'counts',
          array(select jsonb_array_elements_text(stp->'inputs')),
          array(select jsonb_array_elements_text(stp->'outputs'))
        FROM ${ComponentTableName} a JOIN ${GeneTableName} b ON (a.id = b.component_id)
          JOIN ${AseqTableName} c ON (b.aseq_id = c.id)
        WHERE a.genome_id = ? AND stp is not null AND stp->'ranks'->0 is not null
      `
      return this.sequelize_.query(sql, {
        plain: true,
        raw: true,
        replacements: [this.genome_.id],
        transaction,
      })
      .then(() => {
        return this.models_.SignalGene.count({
          include: {
            model: this.models_.Component,
            required: true,
            where: {
              genome_id: this.genome_.id,
            },
          },
          transaction,
        })
      })
      .then((numSignalGenes) => {
        this.logger_.info({numSignalGenes}, `Identified ${numSignalGenes} signaling genes`)
      })
    })
  }

  // Return Stp
  workerModuleRecords() {
    return [this.newWorkerModuleData()]
  }
}
