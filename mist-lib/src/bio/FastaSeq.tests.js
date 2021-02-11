/* eslint-disable no-magic-numbers */

'use strict';

let Seq = require('core-lib/bio/Seq'),
  FastaSeq = require('./FastaSeq');

describe('FastaSeq', function() {
  describe('constructor', function() {
    it('should be instance of Seq', function() {
      let seq = new FastaSeq();
      expect(seq).instanceOf(Seq);
    });

    it('should have base Seq constructor applied', function() {
      let seq = new FastaSeq('Header', ' a 2 tG\n');
      expect(seq.sequence()).equal('a @ tG');
    });
  });

  describe('header', function() {
    it('default constructed instance should have empty string', function() {
      let seq = new FastaSeq();
      expect(seq.header()).equal('');
    });

    it('Leading caret should be removed if supplied', function() {
      let seq = new FastaSeq('>ecoli');
      expect(seq.header()).equal('ecoli');
    });

    it('Caret that is not in the first position should be preserved', function() {
      let seq = new FastaSeq(' >ecoli');
      expect(seq.header()).equal('>ecoli');
    });

    it('Whitespace should be trimmed', function() {
      let seq = new FastaSeq('>  ecoli  ');
      expect(seq.header()).equal('ecoli');
    });
  });

  describe('setHeader', function() {
    it('change the header', function() {
      let seq = new FastaSeq('>ecoli');
      seq.setHeader('chey');
      expect(seq.header()).equal('chey');
    });
  });

  describe('toString', function() {
    let fastaHeader = '>header_name',
      fastaSequence = 'AAAAATTTTTGGGGGCCCCC',
      seq = new FastaSeq(fastaHeader, fastaSequence);

    it('Default should give one line sequence (because it is less than the default chars per line)', function() {
      expect(seq.toString()).equal(`${fastaHeader}\n${fastaSequence}\n`);
    });

    it('Sequence should be separated into lines', function() {
      expect(seq.toString(5)).equal('>header_name\nAAAAA\nTTTTT\nGGGGG\nCCCCC\n');
      expect(seq.toString(1)).equal('>header_name\nA\nA\nA\nA\nA\nT\nT\nT\nT\nT\nG\nG\nG\nG\nG\nC\nC\nC\nC\nC\n');
      expect(seq.toString(19)).equal('>header_name\nAAAAATTTTTGGGGGCCCC\nC\n');
    });

    it('Whitespace should be trimmed', function() {
      expect(seq.toString(5)).equal('>header_name\nAAAAA\nTTTTT\nGGGGG\nCCCCC\n');
    });
  });
});
