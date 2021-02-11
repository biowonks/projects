'use strict';

// Core
const os = require('os');
const path = require('path');

// Vendor
const rimraf = require('rimraf');

// Local
const mutil = require('mist-lib/mutil');
const AbstractPipelineModule = require('./AbstractPipelineModule');
const FileMapper = require('./services/FileMapper');

// Constants
const kRootTmpDirectory = path.join(os.tmpdir(), 'biowonks');

module.exports =
class PerGenomePipelineModule extends AbstractPipelineModule {
  constructor(app, genome) {
    super(app);

    this.genome_ = genome;
    this.fileMapper_ = new FileMapper(kRootTmpDirectory, genome);
    this.dataDirectory_ = this.fileMapper_.genomeRootPath();
  }

  setup() {
    if (this.needsDataDirectory())
      return this.ensureDataDirectoryExists_();

    return null;
  }

  newWorkerModuleData() {
    let workerModuleData = super.newWorkerModuleData();
    workerModuleData.genome_id = this.genome_.id;
    return workerModuleData;
  }

  teardown() {
    if (this.needsDataDirectory()) {
      return new Promise((resolve, reject) => {
        rimraf(this.dataDirectory_, (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }).then(() => {
        this.logger_.info({dataDirectory: this.dataDirectory_}, 'Removed data directory');
      });
    }

    return null;
  }

  // ----------------------------------------------------
  // Protected methods
  needsDataDirectory() {
    return false;
  }

  // ----------------------------------------------------
  // Private methods
  ensureDataDirectoryExists_() {
    return mutil.mkdirp(this.dataDirectory_)
      .then((result) => {
        if (result.created)
          this.logger_.info({dataDirectory: this.dataDirectory_}, 'Created data directory');
      });
  }
};
