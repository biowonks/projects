'use strict'

// Local
const fastaStream = require('./fasta-stream'),
	FastaSeq = require('../bio/FastaSeq')

describe('streams', function() {
	describe('fasta stream', function() {
		it('exported reader === default export', function() {
			expect(fastaStream).equal(fastaStream.reader)
		})

		describe('reader', function() {
			let reader = null,
				result = null

			describe('do not skip empty sequences', function() {
				beforeEach(function() {
					result = []
					reader = fastaStream()
					reader.on('data', function(fastaSeq) {
						result.push(fastaSeq)
					})
				})

				let shouldFail = true,
					failResult = null
				let fixtures = [
					[' ', failResult, shouldFail],
					['1\nABC', failResult, shouldFail],
					['12\nABC', failResult, shouldFail],
					[' >1\nABC', failResult, shouldFail],
					['\n>1\n>ABC', failResult, shouldFail],
					['>', failResult, shouldFail],
					['>1', failResult, shouldFail],
					['>\nABC', failResult, shouldFail],
					['>1\nABC\n>', failResult, shouldFail],
					['>1\nABC\n>2', failResult, shouldFail],
					['>1\nABC\n>2\n', failResult, shouldFail],
					['>1\nABC\n>2\n\n', failResult, shouldFail],
					['>1\nABC\n>2\n\n>3\n>DEF', failResult, shouldFail],

					['', []],
					['>1\nABC', [['1', 'ABC']]],
					['>123\nABC\n>456\nDEF', [['123', 'ABC'], ['456', 'DEF']]],
					['>123\nABC\n>456\nDEF\n', [['123', 'ABC'], ['456', 'DEF']]],
					['>123\nABC\n>456\n\nDEF', [['123', 'ABC'], ['456', 'DEF']]],
					['>Header\n\nA\tB\fC\rD\vE  F\n>Header2\nDEF', [['Header', 'ABCDE  F'], ['Header2', 'DEF']]],
					['>1\nA\n>2\nB\n>3\nC\n>4\nD\n>5\nE\n', [['1', 'A'], ['2', 'B'], ['3', 'C'], ['4', 'D'], ['5', 'E']]],
					['>Header\nABC\nDEF\nGHI\n>Header2\nJKL\n', [['Header', 'ABCDEFGHI'], ['Header2', 'JKL']]]
				]

				fixtures.forEach(function(fixture) {
					let input = fixture[0],
						desiredOutput = fixture[1],
						expectError = fixture[2]

					let messageInput = input.replace(/\s/g, '\\n'),
						itMessage = `"${messageInput}" ${expectError ? 'fails as expected' : 'works'}`
					if (expectError) {
						it(itMessage, function() {
							expect(function() {
								reader.write(input)
								reader.end()
							}).throw(Error)
						})
					}
					else {
						it(itMessage, function() {
							reader.write(input)
							reader.end()

							result.forEach(function(fastaSeq, i) {
								let expected = desiredOutput[i],
									expectedHeader = expected[0],
									expectedSequence = expected[1]
								expect(fastaSeq.header()).equal(expectedHeader)
								expect(fastaSeq.sequence()).equal(expectedSequence)
							})
						})
					}
				})
			})

			describe('skip empty sequences', function() {
				beforeEach(function() {
					result = []
					reader = fastaStream(true)
					reader.on('data', function(fastaSeq) {
						result.push(fastaSeq)
					})
				})

				let shouldFail = true,
					failResult = null
				let fixtures = [
					[' ', failResult, shouldFail],
					['1\nABC', failResult, shouldFail],
					['12\nABC', failResult, shouldFail],
					[' >1\nABC', failResult, shouldFail],
					['\n>1\n>ABC', failResult, shouldFail],
					['>', failResult, shouldFail],
					['>\nABC', failResult, shouldFail],
					['>1\nABC\n>', failResult, shouldFail],

					['>1', []],
					['>1\nABC\n>2', [['1', 'ABC']]],
					['>1\nABC\n>2\n', [['1', 'ABC']]],
					['>1\nABC\n>2\n\n', [['1', 'ABC']]],
					['>1\nABC\n>2\n\n>3\nDEF', [['1', 'ABC'], ['3', 'DEF']]]
				]

				fixtures.forEach(function(fixture) {
					let input = fixture[0],
						desiredOutput = fixture[1],
						expectError = fixture[2]

					let messageInput = input.replace(/\s/g, '\\n'),
						itMessage = `"${messageInput}" ${expectError ? 'fails as expected' : 'works'}`
					if (expectError) {
						it(itMessage, function() {
							expect(function() {
								reader.write(input)
								reader.end()
							}).throw(Error)
						})
					}
					else {
						it(itMessage, function() {
							reader.write(input)
							reader.end()

							// Special case
							if (desiredOutput.length === 0) {
								expect(result.length).equal(0)
								return
							}

							result.forEach(function(fastaSeq, i) {
								let expected = desiredOutput[i],
									expectedHeader = expected[0],
									expectedSequence = expected[1]
								expect(fastaSeq.header()).equal(expectedHeader)
								expect(fastaSeq.sequence()).equal(expectedSequence)
							})
						})
					}
				})
			})
		})

		describe('writer', function() {
			let writer = null
			beforeEach(() => {
				writer = fastaStream.writer()
			})

			function writeAndExpect(fastaSeqs, expectation, done) {
				let result = ''
				for (let fastaSeq of fastaSeqs)
					writer.write(fastaSeq)
				writer.end()

				writer.on('data', function(chunk) {
					result += chunk
				})
				.on('end', function() {
					expect(result).equal(expectation)
					done()
				})
			}

			it('no sequences returns nothing', function(done) {
				writeAndExpect([], '', done)
			})

			it('single sequence', function(done) {
				let	seq = new FastaSeq('chey', 'LKMM')
				writeAndExpect([seq], '>chey\nLKMM\n', done)
			})

			it('multiple sequences', function(done) {
				let	seq1 = new FastaSeq('chey', 'LKMM'),
					seq2 = new FastaSeq('chew', 'ATCG')
				writeAndExpect([seq1, seq2], '>chey\nLKMM\n>chew\nATCG\n', done)
			})

			it('2 chars per line', function(done) {
				writer = fastaStream.writer({charsPerLine: 2})
				let sequence = 'ACGTA'
				writeAndExpect([new FastaSeq('>chey', sequence)], '>chey\nAC\nGT\nA\n', done)
			})
		})
	})
})
