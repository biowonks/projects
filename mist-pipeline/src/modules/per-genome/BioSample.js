'use strict';

const {Op} = require('sequelize');

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
    this.Genome_ = this.models_.Genome;
  }

  undo() {
    const bioSampleId = this.genome_.biosample_id;
    if (!bioSampleId) {
      return Promise.resolve();
    }

    return this.sequelize_.transaction({
      isolationLevel: 'READ COMMITTED',
    }, async(transaction) => {
      const numGenomesWithThisBioSampleId = await this.Genome_.count({
        where: {
          biosample_id: bioSampleId,
        },
        transaction,
      });

      if (numGenomesWithThisBioSampleId > 1) {
        this.logger_.info('Clearing this genomes BioSample record association');
        await this.genome_.update({
          biosample_id: null,
        }, {
          fields: ['biosample_id'],
          transaction,
        });
        return;
      }

      // Otherwise, this is the only remaining genome with this biosample id.
      // Remove the BioSample record and rely on referential integrity to update
      // the genome id to null.
      this.logger_.info('Deleting BioSample record');
      await this.BioSample_.destroy({
        where: {
          id: bioSampleId,
        },
        transaction,
      });
      this.logger_.info('Deleted BioSample record');
    });
  }

  run() {
    const bioSampleAccession = this.genome_.biosample;
    if (this.genome_.biosample_id) {
      this.logger_.info(`BioSample data already exists for: ${bioSampleAccession}`);
      return null;
    }

    // Since a single biosample may have multiple genomes, first check if this data is
    // already present in another genome
    return this.sequelize_.transaction({
      isolationLevel: 'READ COMMITTED',
    }, async(transaction) => {
      const existingBioSampleResult = await this.Genome_.findOne({
        attributes: ['biosample_id'],
        where: {
          biosample: bioSampleAccession,
          biosample_id: {
            [Op.not]: null,
          },
          id: {
            [Op.not]: this.genome_.id,
          },
        },
        transaction,
      });

      let bioSampleId = existingBioSampleResult ? existingBioSampleResult.biosample_id : null;

      if (!bioSampleId) {
        const data = await this.bioSampleService.fetchForAccession(bioSampleAccession);
        if (data === null) {
          this.logger_.info('No BioSample data found; ignoring entry');
          return;
        }

        const [bioSampleRecord, wasCreated] = await this.BioSample_.findOrCreate({
          where: {
            id: data.id,
          },
          defaults: data,
          transaction,
        });
        bioSampleId = bioSampleRecord.id;
        if (wasCreated) {
          this.logger_.info(`Created new BioSample record with id: ${bioSampleId}`);
        }
        else {
          this.logger_.info(`Found existing BioSample record with id: ${bioSampleId}`);
        }
      }
      else {
        this.logger_.info('Found existing genome with matching biosample result');
      }

      await this.genome_.update({
        biosample_id: bioSampleId,
      }, {
        fields: ['biosample_id'],
        transaction,
      });
    });
  }
};
