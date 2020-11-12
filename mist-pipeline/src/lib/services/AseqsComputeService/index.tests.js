/* eslint-disable no-unused-expressions, global-require, no-mixed-requires, no-magic-numbers */

/**
 * Note: somehow when a shallow comparison of Aseq instances fails, expect / chai enumerates the
 * full Instance, which in turn triggers an attempt to load the pg-native module. Not sure why this
 * happens, thus, all comparison of Aseq instances should be done using === and true / false. For
 * example, use:
 *
 * expect(result === aseq).true
 *
 * instead of:
 *
 * expect(result).equal(aseq)
 *
 * Not identical, but related issue: https://github.com/sequelize/sequelize/issues/3781
 */

'use strict';

// Vendor
const bunyan = require('bunyan');

// Local
const AseqsComputeService = require('./index');
const MistBootService = require('mist-lib/services/MistBootService');
const Seq = require('core-lib/bio/Seq');
const config = require('../../../../config');
const testData = require('./tool-runners/test-data');

// Other
const logger = bunyan.createLogger({name: 'AseqsComputeService-tests'});

describe('AseqsComputeService', function() {
  let Aseq = null;
  let models = null;
  before(() => {
    let bootService = new MistBootService();
    models = bootService.setupModels();
    Aseq = models.Aseq;
  });

  describe('tools (static method)', function() {
    it('should return an array of tool-runners', function() {
      let tools = AseqsComputeService.tools();
      expect(tools).a('Array');
      for (let tool of tools) {
        expect(tool).a('Object');
        expect(tool.id).not.empty;
        expect(tool.id).a('String');

        // Special check for the coils meta
        if (tool.id === 'coils') {
          Reflect.deleteProperty(tool, 'id');

          let CoilsToolRunner = require('./tool-runners/CoilsToolRunner');
          expect(tool).deep.equal(CoilsToolRunner.meta);
        }
      }
    });
  });

  describe('targetAseqFields', function() {
    let oldToolRunnerIdMapFn;
    before(() => {
      oldToolRunnerIdMapFn = AseqsComputeService.toolRunnerIdMap;
      AseqsComputeService.toolRunnerIdMap = () => new Map([
        [
          'pfam31',
          {
            id: 'pfam31',
            description: 'pfam domains',
            requiredAseqFields: undefined,
          },
        ],
        [
          'segs',
          {
            id: 'segs',
            description: 'low-complexity',
          },
        ],
        [
          'stp',
          {
            id: 'stp',
            description: 'signal transduction prediction',
            requiredAseqFields: ['pfam31', 'agfam1', 'ecf1'],
          },
        ],
        [
          'stp2',
          {
            id: 'stp2',
            description: 'stp version 2',
            requiredAseqFields: ['pfam31', 'agfam2'],
          },
        ],
      ]);
    });

    after(() => {
      AseqsComputeService.toolRunnerIdMap = oldToolRunnerIdMapFn;
    });

    it('returns the unique set of required aseq fields present in the tool runner map', function() {
      const toolIds = ['stp', 'pfam31', 'stp', 'stp2'];
      const x = new AseqsComputeService(models, Aseq, config, logger);
      expect(x.targetAseqFields(toolIds)).members(['pfam31', 'agfam1', 'agfam2', 'ecf1']);
    });

    it('ignores unrecognized tool ids', function() {
      const x = new AseqsComputeService(models, Aseq, config, logger);
      expect(x.targetAseqFields(['invalid', 'stp2'])).members(['pfam31', 'agfam2']);
    });
  });

  describe('compute', function() {
    it('run coils and segs on the given aseqs', function() {
      const aseqs = [
        Aseq.build(testData[0].coreData),
        Aseq.build(testData[1].coreData),
      ];

      const x = new AseqsComputeService(models, Aseq, config, logger);
      return x.compute(aseqs, ['coils', 'segs'])
        .then((resultAseqs) => {
          expect(resultAseqs === aseqs).ok;
          for (let i = 0; i < aseqs.length; i++) {
            expect(resultAseqs[i] === aseqs[i]).true;
            expect(aseqs[i].coils).eql(testData[i].coils);
            expect(aseqs[i].segs).eql(testData[i].segs);
          }
        });
    });
  });

  describe('groupByUndoneTools', function() {
    const seq1 = new Seq('MLTNY');
    const seq2 = new Seq('MLTNW');
    const seq3 = new Seq('MLTNC');
    const seq4 = new Seq('MLTND');

    it('throws error if either argument is not an array', function() {
      const x = new AseqsComputeService(models, Aseq, config, logger);
      expect(function() {
        x.groupByUndoneTools();
      }).throw(Error);

      expect(function() {
        x.groupByUndoneTools(null, []);
      }).throw(Error);
    });

    it('returns single element with all aseqs if all tools are done', function() {
      const x = new AseqsComputeService(models, Aseq, config, logger);
      const toolIds = ['segs', 'coils'];
      const aseqs = [
        Aseq.fromSeq(seq1),
        Aseq.fromSeq(seq2),
        Aseq.fromSeq(seq3),
      ];

      aseqs.forEach((aseq) => {
        toolIds.forEach((toolId) => {
          aseq[toolId] = 1;
        });
      });

      const result = x.groupByUndoneTools(aseqs, toolIds);
      expect(result[0]).a('Object');
      expect(result[0].toolIds).deep.equal([]);
      expect(result[0].aseqs.length).equal(3);
      for (let i = 0; i < aseqs.length; i++)
        expect(result[0].aseqs[i] === aseqs[i]).true;
    });

    it('returns all possible groupings (and multiple members)', function() {
      const x = new AseqsComputeService(models, Aseq, config, logger);
      const toolIds = ['segs', 'coils'];
      const aseqs = [
        Aseq.fromSeq(seq1), // 0
        Aseq.fromSeq(seq2), // 1
        Aseq.fromSeq(seq3), // 2
        Aseq.fromSeq(seq4), // 3
        Aseq.fromSeq(seq2), // 4
      ];

      // ---------------------
      // Set the done tool ids
      // aseqs.0: coils + segs
      aseqs[0].segs = 1;
      aseqs[0].coils = 1;
      // aseqs.1: coils
      aseqs[1].coils = 1;
      // aseqs.2: segs
      aseqs[2].segs = 1;
      // aseqs.3: none
      // aseqs.4: coils
      aseqs[4].coils = 1;

      const result = x.groupByUndoneTools(aseqs, toolIds);
      expect(result.length).equal(4);
      expect(result[0].toolIds).eql([]);
      expect(result[0].aseqs[0] === aseqs[0]).true;

      expect(result[1].toolIds).eql(['segs']);
      expect(result[1].aseqs.length).equal(2);
      expect(result[1].aseqs[0] === aseqs[1]).true;
      expect(result[1].aseqs[1] === aseqs[4]).true;

      expect(result[2].toolIds).eql(['coils']);
      expect(result[2].aseqs[0] === aseqs[2]).true;

      expect(result[3].toolIds).eql(['segs', 'coils']);
      expect(result[3].aseqs[0] === aseqs[3]).true;
    });
  });
});
