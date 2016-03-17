'use strict'

let Seq = require('./Seq'),
	FastaSeq = require('./FastaSeq'),
	assert = require('assert')

describe('FastaSeq', function() {
	describe('constructor', function() {
		it('should be instance of Seq', function() {
			let seq = new FastaSeq()
			expect(seq).instanceOf(Seq)
		})

		it('should have base Seq constructor applied', function() {
			let seq = new FastaSeq('Header', ' a 2 tG\n')
			expect(seq.sequence()).equal('A@TG')
		})
	})

	describe('header', function() {
		it('default constructed instance should have empty string', function() {
			let seq = new FastaSeq()
			expect(seq.header()).equal('')
		})

		it('Leading caret should be removed if supplied', function() {
			let seq = new FastaSeq('>ecoli')
			expect(seq.header()).equal('ecoli')
		})

		it('Caret that is not in the first position should be preserved', function() {
			let seq = new FastaSeq(' >ecoli')
			expect(seq.header()).equal('>ecoli')
		})

		it('Whitespace should be trimmed', function() {
			let seq = new FastaSeq('>  ecoli  ')
			expect(seq.header()).equal('ecoli')
		})
	})

	describe('toString', function() {
		let fastaHeader = '>header_name',
			fastaSequence = 'AAAAATTTTTGGGGGCCCCC',
			uncleanedFastaSequence = 'AAAA\nATTTT\nTGGG\nGGCCC\nCC',
			seq = new FastaSeq(fastaHeader, fastaSequence),
			uncleanedSeq = new FastaSeq(fastaHeader,uncleanedFastaSequence)

		it('Default should give one line sequence', function() {
			expect(seq.toString()).equal(fastaHeader + '\n' + fastaSequence + '\n')
		})

		it('Negative values should give one line sequence', function() {
			expect(seq.toString(-2)).equal(fastaHeader + '\n' + fastaSequence + '\n')
		})

		it('Non-number parameter should give an error', function() {
			expect(function(){seq.toString('non-number')}).throw(Error)
		})

		it('Sequence should be separated into lines', function() {
			expect(seq.toString(5)).equal('>header_name\nAAAAA\nTTTTT\nGGGGG\nCCCCC\n')
			expect(seq.toString(1)).equal('>header_name\nA\nA\nA\nA\nA\nT\nT\nT\nT\nT\nG\nG\nG\nG\nG\nC\nC\nC\nC\nC\n')
			expect(seq.toString(19)).equal('>header_name\nAAAAATTTTTGGGGGCCCC\nC\n')
		})

		it('Whitespace should be trimmed', function() {
			expect(seq.toString(5)).equal('>header_name\nAAAAA\nTTTTT\nGGGGG\nCCCCC\n')
		})
	})
})
