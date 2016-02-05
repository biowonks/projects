'use strict'

let Seq = require('./Seq'),
	FastaSeq = require('./FastaSeq')

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
})
