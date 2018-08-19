'use strict'

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule')
const AseqsComputeService = require('lib/services/AseqsComputeService')

module.exports =
class Mist2STP extends PerGenomePipelineModule {
  static description() {
    return 'MiST2 prediction of signal transduction proteins'
  }

  static dependencies() {
    return [
      'NCBICoreData',
      // 'AseqCompute:pfam31',
      'AseqCompute:agfam2',
      'AseqCompute:ecf1',
    ]
  }

  constructor(app, genome) {
    super(app, genome)

    this.St1Gene_ = this.models_.St1Gene
		this.aseqsService_ = new AseqsComputeService(this.models_.Aseq, app.config, this.logger_)
  }

  optimize() {
    return this.analyze(
      this.St1Gene_.getTableName(),
      this.models_.Aseq.getTableName(),
    )
  }

  undo() {
		this.logger_.info(`Deleting genome ${this.St1Gene_.getTableName()}`)
    return this.St1Gene_.destroy({
      where: {
        genome_id: this.genome_.id,
      },
    })
  }

  run() {
    const stToolId = 'st1'
    const fields = ['pfam31', 'agfam2', 'ecf1']

    return this.aseqsService_.unanalyzedAseqs(this.genome_.id, stToolId, fields)
      .then(this.predictSTP_.bind(this))
      .then(this.saveResults_.bind(this))
  }

	// ----------------------------------------------------
  // Private methods
  predictSTP_(aseqs) {
    return Promise.resolve(aseqs)
  }

  saveResults_(aseqs) {
    return this.sequelize_.transaction({isolationLevel: 'READ COMMITTED'}, (transaction) => {
      return this.aseqsService_.saveToolData(aseqs, 'st1', transation)
        .then(this.saveGenomeResults_.bind(this, aseqs, transaction))
    })
  }

  saveGenomeResults_(aseqs, transaction) {

  }
}
