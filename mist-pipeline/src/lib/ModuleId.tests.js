/* eslint-disable no-magic-numbers */

'use strict';

// Local
const ModuleId = require('./ModuleId');

describe('pipeline', function() {
  describe('ModuleId', function() {
    it('name', function() {
      let x = new ModuleId('SeedNewGenomes');
      expect(x.name()).equal('SeedNewGenomes');
    });

    it('subNames', function() {
      let x = new ModuleId('AseqCompute', ['segs', 'coils']);
      expect(x.subNames()).eql(['segs', 'coils']);
    });

    describe('unnest', function() {
      it('returns array with copy if no subNames', function() {
        let x = new ModuleId('SeedNewGenomes'),
          result = x.unnest();
        expect(result).a('array');
        expect(result.length).equal(1);
        expect(result[0].name()).equal('SeedNewGenomes');
        expect(result[0].subNames()).eql([]);
      });

      it('returns a single item for only 1 subName', function() {
        let x = new ModuleId('AseqCompute', ['segs']),
          result = x.unnest();
        expect(result).a('array');
        expect(result.length).equal(1);
        expect(result[0].name()).equal('AseqCompute');
        expect(result[0].subNames()).eql(['segs']);
      });

      it('returns a single item for each subName', function() {
        let x = new ModuleId('AseqCompute', ['segs', 'coils']),
          result = x.unnest();
        expect(result).a('array');
        expect(result.length).equal(2);
        expect(result[0].name()).equal('AseqCompute');
        expect(result[0].subNames()).eql(['segs']);
        expect(result[1].name()).equal('AseqCompute');
        expect(result[1].subNames()).eql(['coils']);
      });
    });

    describe('toString', function() {
      it('no subnames returns name', function() {
        let x = new ModuleId('SeedNewGenomes');
        expect(x.toString()).equal('SeedNewGenomes');
      });

      it('single subname', function() {
        let x = new ModuleId('AseqCompute', ['segs']);
        expect(x.toString()).equal('AseqCompute:segs');
      });

      it('multiple subnames', function() {
        let x = new ModuleId('AseqCompute', ['segs', 'coils']);
        expect(x.toString()).equal('AseqCompute:segs+coils');
      });
    });

    describe('fromString (static)', function() {
      let errorCases = [
        {input: '@#$', name: 'module name contains invalid character'},
        {input: 'AseqCompute:', name: 'colon without sub module name'},
        {input: 'AseqCompute:@', name: 'sub module name contains invalid character'},
        {input: 'AseqCompute:+', name: 'empty submodule name'},
      ];

      errorCases.forEach((errorCase) => {
        it(`${errorCase.name} throws error`, function() {
          expect(function() {
            ModuleId.fromString(errorCase.input);
          }).throw(Error);
        });
      });

      it('solely module name', function() {
        let x = ModuleId.fromString('SeedNewGenomes');
        expect(x).instanceof(ModuleId);
        expect(x.name()).equal('SeedNewGenomes');
        expect(x.subNames()).eql([]);
      });

      it('module name plus one subname', function() {
        let x = ModuleId.fromString('AseqCompute:segs');
        expect(x).instanceof(ModuleId);
        expect(x.name()).equal('AseqCompute');
        expect(x.subNames()).eql(['segs']);
      });

      it('module name plus multiple subnames', function() {
        let x = ModuleId.fromString('AseqCompute:segs+coils');
        expect(x).instanceof(ModuleId);
        expect(x.name()).equal('AseqCompute');
        expect(x.subNames()).eql(['segs', 'coils']);
      });
    });

    describe('fromStrings (static)', function() {
      it('empty input array returns empty array', function() {
        expect(ModuleId.fromStrings([])).eql([]);
      });

      it('each input string returns an equivalent ModuleId', function() {
        let strings = [
            'SeedNewGenomes',
            'AseqCompute:segs',
            'AseqCompute:segs+coils',
          ],
          x = ModuleId.fromStrings(strings);

        expect(x).a('array');
        expect(x.length).equal(strings.length);
        expect(x[0].name()).equal('SeedNewGenomes');
        expect(x[0].subNames()).eql([]);

        expect(x[1].name()).equal('AseqCompute');
        expect(x[1].subNames()).eql(['segs']);

        expect(x[2].name()).equal('AseqCompute');
        expect(x[2].subNames()).eql(['segs', 'coils']);
      });
    });

    describe('unnest (static)', function() {
      it('single module with just the name returns one ModuleId', function() {
        let x = ModuleId.unnest([new ModuleId('SeedNewGenomes')]);
        expect(x).a('array');
        expect(x.length).equal(1);
        expect(x[0].name()).equal('SeedNewGenomes');
        expect(x[0].subNames()).eql([]);
      });

      it('single module with name and one subname returns one ModuleId', function() {
        let x = ModuleId.unnest([new ModuleId('AseqCompute', ['segs'])]);
        expect(x).a('array');
        expect(x.length).equal(1);
        expect(x[0].name()).equal('AseqCompute');
        expect(x[0].subNames()).eql(['segs']);
      });

      it('single module with multiple subnames returns two ModuleIds', function() {
        let x = ModuleId.unnest([new ModuleId('AseqCompute', ['segs', 'coils'])]);
        expect(x).a('array');
        expect(x.length).equal(2);
        expect(x[0].name()).equal('AseqCompute');
        expect(x[0].subNames()).eql(['segs']);
        expect(x[1].name()).equal('AseqCompute');
        expect(x[1].subNames()).eql(['coils']);
      });

      it('complex module id array', function() {
        let x = ModuleId.unnest([
          new ModuleId('SeedNewGenomes'),
          new ModuleId('AseqCompute', ['segs']),
          new ModuleId('AseqCompute', ['coils', 'pfam']),
        ]);
        expect(x).a('array');
        expect(x.length).equal(4);
        expect(x[0].name()).equal('SeedNewGenomes');
        expect(x[0].subNames()).eql([]);
        expect(x[1].name()).equal('AseqCompute');
        expect(x[1].subNames()).eql(['segs']);
        expect(x[2].name()).equal('AseqCompute');
        expect(x[2].subNames()).eql(['coils']);
        expect(x[3].name()).equal('AseqCompute');
        expect(x[3].subNames()).eql(['pfam']);
      });
    });

    describe('nest (static)', function() {
      it('consolidates ModuleIds with the same name', function() {
        let x = ModuleId.nest([
          new ModuleId('AseqCompute', ['segs']),
          new ModuleId('SeedNewGenomes'),
          new ModuleId('AseqCompute', ['coils', 'pfam']),
          new ModuleId('SeedNewGenomes'),
          new ModuleId('Dummy', ['alpha', 'beta']),
          new ModuleId('Dummy', ['gamma', 'delta']),
        ]);
        expect(x).a('array');
        expect(x.length).equal(3);
        expect(x[0].name()).equal('AseqCompute');
        expect(x[0].subNames()).eql(['segs', 'coils', 'pfam']);
        expect(x[1].name()).equal('SeedNewGenomes');
        expect(x[1].subNames()).eql([]);
        expect(x[2].name()).equal('Dummy');
        expect(x[2].subNames()).eql(['alpha', 'beta', 'gamma', 'delta']);
      });
    });
  });
});
