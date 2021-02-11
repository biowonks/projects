'use strict';

// Local
const {mapHmmer3RowHashesToArrays} = require('seqdepot-lib/hmmer-utils');
const StpService = require('../../Stp/StpService');

const AbstractToolRunner = require('./AbstractToolRunner');
const Pfam31ToolRunner = require('./Pfam31ToolRunner');
const Agfam2ToolRunner = require('./Agfam2ToolRunner');
const Ecf1ToolRunner = require('./Ecf1ToolRunner');

// Constants
const kStpId = 'stp';

module.exports =
class StpToolRunner extends AbstractToolRunner {
  constructor(config, models) {
    super(config, models);
    this.stpService_ = null;
    this.version_ = config.version;
    this.cheHmmDatabasePath = config.che3DatabasePath;
  }

  setup_() {
    return this.models_.SignalDomain.getMinimalStpSpec(this.version_)
      .then((stpSpec) => {
        this.stpService_ = new StpService(stpSpec, this.cheHmmDatabasePath);
      });
  }

  onRun_(aseqs) {
    return this.stpService_.analyze(aseqs)
      .then((summaries) => {
        summaries.forEach((summary, i) => {
          if (summary) {
            delete summary.inputFunctions;
            delete summary.outputFunctions;
            summary.version = this.version_;
            if (summary.cheHits)
              summary.cheHits = mapHmmer3RowHashesToArrays(summary.cheHits);
          }
          aseqs[i][kStpId] = summary || {version: null};
        });
        this.tick_(aseqs.length);
        return aseqs;
      });
  }
};

module.exports.meta = {
  hidden: true, // Do not list this tool runner as part of the AseqCompute submodules
  id: kStpId,
  description: 'signal transduction protein identification',
  requiredAseqFields: [
    Pfam31ToolRunner.meta.id,
    Agfam2ToolRunner.meta.id,
    Ecf1ToolRunner.meta.id,
  ],
};
