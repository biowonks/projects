/* eslint-disable no-magic-numbers */
'use strict'

// Local
const seqUtil = require('./seq-util')

describe('seq-util', function() {
	describe('distribution', function() {
		it('returns empty object if empty sequence', function() {
			expect(seqUtil.distribution()).eql({})
			expect(seqUtil.distribution('')).eql({})
		})

		it('counts all characters including whitespace', function() {
			expect(seqUtil.distribution('A')).eql({A: 1})
			expect(seqUtil.distribution(' A ')).eql({A: 1, ' ': 2})
			expect(seqUtil.distribution('ATCGatcg')).eql({
				A: 1,
				T: 1,
				C: 1,
				G: 1,
				a: 1,
				t: 1,
				c: 1,
				g: 1
			})
		})
	})

	describe('fasta', function() {
		it('returns FASTA compatible sequence', function() {
			expect(seqUtil.fasta('chey', 'ATCG')).equal('>chey\nATCG\n')
		})

		it('returns FASTA compatible sequence split among lines', function() {
			expect(seqUtil.fasta('chey', 'ATCG', 3)).equal('>chey\nATC\nG\n')
		})
	})

	describe('gcPercent', function() {
		it('empty sequence returns 0', function() {
			expect(seqUtil.gcPercent()).equal(0)
			expect(seqUtil.gcPercent(null)).equal(0)
			expect(seqUtil.gcPercent('')).equal(0)
		})

		it('all g/G/c/C characters contribute to the gc calculation', function() {
			expect(seqUtil.gcPercent('ATat')).equal(0)
			expect(seqUtil.gcPercent('G')).equal(100.)
			expect(seqUtil.gcPercent('GG')).equal(100.)
			expect(seqUtil.gcPercent('CG')).equal(100.)
			expect(seqUtil.gcPercent('AG')).equal(50.)
			expect(seqUtil.gcPercent('Ag')).equal(50.)
			expect(seqUtil.gcPercent('Ct')).equal(50.)
			expect(seqUtil.gcPercent('ct')).equal(50.)
		})
	})

	describe('parseMaskedRegions', function() {
		let examples = [
			{sequence: '', output: []},
			{sequence: 'ATCGX', output: []},
			{sequence: 'x', output: [[1, 1]]},
			{sequence: 'xA', output: [[1, 1]]},
			{sequence: 'Ax', output: [[2, 2]]},
			{sequence: 'xAx', output: [[1, 1], [3, 3]]},
			{sequence: 'xx', output: [[1, 2]]},
			{sequence: 'ATxxCTxxx', output: [[3, 4], [7, 9]]}
		]

		examples.forEach((example) => {
			it(`${example.sequence} --> ${JSON.stringify(example.output)}`, function() {
				expect(seqUtil.parseMaskedRegions(example.sequence)).deep.equal(example.output)
			})
		})
	})

	describe('spliceNewLines', function() {
		let sequence = 'AAAAATTTTTGGGGGCCCCC'

		it('default charsPerLine', function() {
			expect(seqUtil.spliceNewLines(sequence, 5)).equal('AAAAA\nTTTTT\nGGGGG\nCCCCC\n')
		})

		it('0 charsPerLine assumes default charsPerLine', function() {
			expect(seqUtil.spliceNewLines(sequence, 0)).equal('AAAAATTTTTGGGGGCCCCC\n')
		})

		it('Negative charsPerLine throws error', function() {
			expect(function() {
				seqUtil.spliceNewLines(sequence, -1)
			}).throw(Error)
		})

		it('Non-number parameter throws error', function() {
			expect(function() {
				seqUtil.spliceNewLines(sequence, 'non-number')
			}).throw(Error)
		})

		it('charsPerLine > length returns entire sequence', function() {
			expect(seqUtil.spliceNewLines(sequence, sequence.length + 1)).equal(sequence + '\n')
		})

		it('charsPerLine === length returns entire sequence', function() {
			expect(seqUtil.spliceNewLines(sequence, sequence.length)).equal(sequence + '\n')
		})

		it('charsPerLine < length splits it into lines as expected', function() {
			expect(seqUtil.spliceNewLines(sequence, 3)).equal('AAA\nAAT\nTTT\nTGG\nGGG\nCCC\nCC\n')
		})
	})
})
