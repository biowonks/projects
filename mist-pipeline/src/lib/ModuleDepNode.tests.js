/* eslint-disable no-new, no-unused-expressions, no-magic-numbers */

'use strict';

// Local
let ModuleDepNode = require('./ModuleDepNode');

describe('pipeline', function() {
  describe('ModuleDepNode', function() {
    it('constructor', function() {
      new ModuleDepNode();
      new ModuleDepNode('name');
      new ModuleDepNode('name', {});
    });

    it('[set] WorkerModule', function() {
      let x = new ModuleDepNode('core-data');
      expect(x.workerModule()).null;

      let mockWorkerModule = {
        module: 'core-data',
      };
      x.setWorkerModule(mockWorkerModule);
      expect(x.workerModule()).equal(mockWorkerModule);

      mockWorkerModule.module = 'not-core-data';
      expect(function() {
        x.setWorkerModule(mockWorkerModule);
      }).throw(Error);
    });
  });
});
