'use strict'

let FastaReaderStream = require('./FastaReaderStream')

describe('FastaReaderStream', function() {
	let reader,
		result

	describe('do not skip empty sequences', function() {
		beforeEach(function() {
			result = []
			reader = new FastaReaderStream()
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
			['>Header\n\nA\tB\fC\rD\vE  F\n>Header2\nDEF', [['Header', 'ABCDEF'], ['Header2', 'DEF']]],
			['>1\nA\n>2\nB\n>3\nC\n>4\nD\n>5\nE\n', [['1', 'A'], ['2', 'B'], ['3', 'C'], ['4', 'D'], ['5', 'E']]],
			['>Header\nABC\nDEF\nGHI\n>Header2\nJKL\n', [['Header', 'ABCDEFGHI'], ['Header2', 'JKL']]]
		]

		fixtures.forEach(function(fixture) {
			let input = fixture[0],
				desiredOutput = fixture[1],
				expectError = fixture[2]

			let messageInput = input.replace(/\s/g, '\\n'),
				itMessage = '"' + messageInput + '" ' + (expectError ? 'fails as expected' : 'works')
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
			reader = new FastaReaderStream(true)
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
			['>1\nABC\n>2\n\n>3\nDEF', [['1', 'ABC'], ['3', 'DEF']]],
		]

		fixtures.forEach(function(fixture) {
			let input = fixture[0],
				desiredOutput = fixture[1],
				expectError = fixture[2]

			let messageInput = input.replace(/\s/g, '\\n'),
				itMessage = '"' + messageInput + '" ' + (expectError ? 'fails as expected' : 'works')
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
						expect(result.length).equal(0);
						return;
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
