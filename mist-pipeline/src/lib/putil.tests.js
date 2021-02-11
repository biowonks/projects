/* eslint-disable no-magic-numbers */

'use strict';

// Core
const path = require('path');

// Local
const putil = require('./putil');
const ModuleId = require('./ModuleId');

const OnceOneModule = require('./test-data/module-dir1/OnceOneModule');
const OnceTwoModule = require('./test-data/module-dir1/OnceTwoModule');
const PerGenomeOneModule = require('./test-data/module-dir1/PerGenomeOneModule');

const OnceThreeModule = require('./test-data/module-dir2/OnceThreeModule');
const PerGenomeTwoModule = require('./test-data/module-dir2/PerGenomeTwoModule');
const PerGenomeThreeModule = require('./test-data/module-dir2/PerGenomeThreeModule');
const PerGenomeFourModule = require('./test-data/module-dir2/PerGenomeFourModule');

describe('pipeline', function() {
  describe('putil', function() {
    it('enumerateModules', function() {
      let x = putil.enumerateModules(
        path.resolve(__dirname, 'test-data', 'module-dir1'),
        path.resolve(__dirname, 'test-data', 'module-dir2'),
      );

      expect(x).a('object');
      expect(x).property('once');
      expect(x.once).a('array');
      expect(x.once.length).equal(3);
      expect(x.once).members([OnceOneModule, OnceTwoModule, OnceThreeModule]);

      expect(x).property('perGenome');
      expect(x.perGenome).a('array');
      expect(x.perGenome.length).equal(4);
      expect(x.perGenome).members([
        PerGenomeOneModule,
        PerGenomeTwoModule,
        PerGenomeThreeModule,
        PerGenomeFourModule,
      ]);

      expect(x).property('all');
      expect(x.all).eql([...x.once, ...x.perGenome]);
    });

    it('findInvalidModuleIds', function() {
      let moduleIds = [
          new ModuleId('OnceOneModule'),
          new ModuleId('OnceTwoModule'),
          new ModuleId('InvalidModule'),
          new ModuleId('PerGenomeOneModule'),
          new ModuleId('PerGenomeOneModule', ['subModule1', 'subModule2', 'invalid']),
        ],
        x = putil.findInvalidModuleIds(moduleIds, [
          OnceOneModule,
          PerGenomeOneModule,
        ]);

      expect(x).a('array');
      expect(x.length).equal(4);
      expect(x[0].toString()).equal('OnceTwoModule');
      expect(x[1].toString()).equal('InvalidModule');
      expect(x[2].toString()).equal('PerGenomeOneModule');
      expect(x[3].toString()).equal('PerGenomeOneModule:invalid');
    });

    it('matchingModuleIds', function() {
      let OnceOneModuleId = new ModuleId('OnceOneModule'),
        OnceTwoModuleId = new ModuleId('OnceTwoModule'),
        PerGenomeOneModuleIdA = new ModuleId('PerGenomeOneModule', ['subModule1', 'subModule2']),
        PerGenomeOneModuleIdB = new ModuleId('PerGenomeOneModule'),
        PerGenomeTwoModuleId = new ModuleId('PerGenomeTwoModule');

      let x = putil.matchingModuleIds([
        OnceOneModuleId,
        OnceTwoModuleId,
        PerGenomeOneModuleIdA,
        PerGenomeOneModuleIdB,
        PerGenomeTwoModuleId,
      ], [
        OnceOneModule,
        PerGenomeOneModule,
      ]);

      expect(x).eql([
        OnceOneModuleId,
        PerGenomeOneModuleIdA,
        PerGenomeOneModuleIdB,
      ]);
    });

    it('unnestedDependencyArray', function() {
      const x = putil.unnestedDependencyArray([
        OnceOneModule,
        OnceTwoModule,
        PerGenomeOneModule,
        PerGenomeTwoModule,
        PerGenomeFourModule,
      ]);
      expect(x).eql([
        {
          name: 'OnceOneModule',
          dependencies: [],
        },
        {
          name: 'OnceTwoModule',
          dependencies: [],
        },
        {
          name: 'PerGenomeOneModule:subModule1',
          dependencies: ['OnceTwoModule'],
        },
        {
          name: 'PerGenomeOneModule:subModule2',
          dependencies: ['OnceTwoModule'],
        },
        {
          name: 'PerGenomeTwoModule',
          dependencies: [],
        },
        {
          name: 'PerGenomeFourModule:subModule1',
          dependencies: [
            'OnceTwoModule',
            'PerGenomeTwoModule',
          ],
        },
        {
          name: 'PerGenomeFourModule:subModule2',
          dependencies: [
            'OnceTwoModule',
            'PerGenomeOneModule:subModule1',
          ],
        },
      ]);
    });

    it('mapModuleClassesByName', function() {
      let x = putil.mapModuleClassesByName([OnceOneModule, PerGenomeOneModule]);
      expect(Array.from(x.keys())).eql(['OnceOneModule', 'PerGenomeOneModule']);
    });
  });
});
