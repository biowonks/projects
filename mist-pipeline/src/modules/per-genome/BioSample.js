'use strict'

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule')

module.exports =
class BioSample extends PerGenomePipelineModule {
  static description() {
    return 'fetches biosample data from NCBI'
  }

  constructor(app, genome) {
    super(app, genome)
    this.bioSampleService = app.bioSampleService
    this.BioSample_ = this.models_.BioSample
  }

  run() {
    const bioSampleId = this.genome_.biosample

    return this.BioSample_.findByPk(bioSampleId)
      .then((bioSample) => {
        if (bioSample) {
          this.logger_.info(`BioSample data already exists for: ${bioSampleId}`)
          return null
        }

        return this.bioSampleService.fetch(bioSampleId)
          .then((data) => this.BioSample_.create(data))
          .then((bioSampleRecord) => {
            this.logger_.info(`Created BioSample record for: ${bioSampleRecord.id}`)
          })
      })
  }
}
