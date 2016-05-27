/* eslint-disable no-undefined, no-magic-numbers */

'use strict'

let genbankParser = require('./genbank-parser')

describe.only('genbankParser', function() {
	describe('parseLocus', function() {
		let invalidLines = [
			undefined,
			null,
			''
		]
		invalidLines.forEach((line) => {
			it(`throws error on ${String(line)} line`, function() {
				expect(function() {
					genbankParser.parseLocus()
				}).throw(Error)
			})
		})

		for (let i = 1; i <= 10; i++) {
			if (i === 8)
				continue

			it(`throws error with ${i} space separated values`, function() {
				let line = 'x'.repeat(i)
					.split('')
					.join(' ')
				expect(function() {
					genbankParser.parseLocus(line)
				}).throw(Error)
			})
		}

		it('values without strandedness', function() {
			let line = 'LOCUS       NC_019563            1494183 bp    DNA     circular CON 30-JUL-2015'
			expect(genbankParser.parseLocus(line)).deep.equal({
				name: 'NC_019563',
				bp: 1494183,
				moleculeType: 'DNA',
				topology: 'circular',
				divisionCode: 'CON',
				date: '30-JUL-2015'
			})
		})

		it('values with strandedness', function() {
			let line = 'LOCUS       NC_019563            1494183 bp  ss-rRNA     linear   CON 30-JUL-2015'
			expect(genbankParser.parseLocus(line)).deep.equal({
				name: 'NC_019563',
				bp: 1494183,
				moleculeType: 'ss-rRNA',
				topology: 'linear',
				divisionCode: 'CON',
				date: '30-JUL-2015'
			})
		})
	})
})
