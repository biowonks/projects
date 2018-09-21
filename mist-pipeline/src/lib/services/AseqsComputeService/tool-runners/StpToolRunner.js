'use strict'

// Local
const StpService = require('mist-lib/services/StpService/StpService')

const AbstractToolRunner = require('./AbstractToolRunner')
const Pfam31ToolRunner = require('./Pfam31ToolRunner')
const Agfam2ToolRunner = require('./Agfam2ToolRunner')
const Ecf1ToolRunner = require('./Ecf1ToolRunner')

// Constants
const kStpId = 'stp'

module.exports =
class StpToolRunner extends AbstractToolRunner {
  constructor(config, models) {
    super(config, models)
    this.stpService_ = null
  }

  setup_() {
    return this.models_.SignalDomain.getMinimalStpSpec(this.config_.version)
      .then((stpSpec) => {
        this.stpService_ = new StpService(stpSpec)
      })
  }

  onRun_(aseqs) {
    return new Promise((resolve, reject) => {
      try {
        aseqs.forEach((aseq) => {
          const result = this.stpService_.analyze(aseq)
          aseq[kStpId] = result !== null ? result : {}
        })
      } catch (error) {
        reject(error)
        return
      }
      this.tick_(aseqs.length)
      resolve(aseqs)
    })
  }
}

module.exports.meta = {
  hidden: true, // Do not list this tool runner as part of the AseqCompute submodules
  id: kStpId,
  description: 'signal transduction protein identification',
  requiredAseqFields: [
    Pfam31ToolRunner.meta.id,
    Agfam2ToolRunner.meta.id,
    Ecf1ToolRunner.meta.id,
  ]
}
