'use strict';

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule');

module.exports =
class BioSample extends PerGenomePipelineModule {
  static description() {
    return 'fetches biosample data from NCBI';
  }

  constructor(app, genome) {
    super(app, genome);
    this.bioSampleService = app.bioSampleService;
    this.BioSample_ = this.models_.BioSample;
  }

  run() {
    const bioSampleAccession = this.genome_.biosample;

    return this.BioSample_.findByPk(bioSampleAccession)
      .then((bioSample) => {
        if (bioSample) {
          this.logger_.info(`BioSample data already exists for: ${bioSampleAccession}`);
          return null;
        }

        return this.bioSampleService.fetchForAccession(bioSampleAccession)
          .then((data) => this.BioSample_.create(data))
          .then((bioSampleRecord) => {
            this.logger_.info(`Created BioSample record for: ${bioSampleRecord.id}`);
          });
      });
  }
};
