/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict';

// Core
const path = require('path');

// Local
const MistBootService = require('mist-lib/services/MistBootService');
const Pfam31ToolRunner = require('./Pfam31ToolRunner');
const testData = require('./test-data');

// Other
const databasePath = path.resolve(__dirname, '..', '..', '..', 'streams', 'test-data', 'test.hmm');
const numHmms = 16295;

describe('services', function() {
  describe('AseqsService', function() {
    describe('Pfam31ToolRunner', function() {
      let Aseq = null;
      before(() => {
        let bootService = new MistBootService();
        Aseq = bootService.setupModels().Aseq;
      });

      it('computes and updates aseqs pfam31 field', function() {
        const pfamConfig = {
          databasePath,
          z: numHmms,
        };
        const x = new Pfam31ToolRunner(pfamConfig);
        const aseqs = [
          Aseq.build(testData[2].coreData),
        ];
        expect(aseqs[0].pfam31).not.ok;

        return x.run(aseqs)
          .then((resultAseqs) => {
            expect(aseqs).equal(resultAseqs);
            expect(aseqs[0].pfam31).eql(testData[2].pfam31);
          });
      });
    });
  });
});
