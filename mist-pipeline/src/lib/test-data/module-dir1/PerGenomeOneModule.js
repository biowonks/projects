'use strict';

// Local
const PerGenomePipelineModule = require('../../PerGenomePipelineModule');

module.exports =
class PerGenomeOneModule extends PerGenomePipelineModule {
  static dependencies() {
    return ['OnceTwoModule'];
  }

  static subModuleMap() {
    return new Map([
      [
        'subModule1',
        {
          description: 'subModule 1 description',
          dependencies: [],
        },
      ],
      [
        'subModule2',
        {
          description: 'subModule 2 description',
          dependencies: [],
        },
      ],
    ]);
  }
};
