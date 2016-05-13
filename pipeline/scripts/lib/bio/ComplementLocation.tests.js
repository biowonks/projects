/* eslint-disable no-unused-expressions, no-magic-numbers, no-new */

'use strict'

let ComplementLocation = require('./ComplementLocation'),
	Location = require('./Location'),
	LocationPoint = require('./LocationPoint'),
	Seq = require('./Seq')

describe('ComplementLocation', function() {
	let seq = new Seq('ATCGNXATCG')
	//                 |   |    |
	//                 1   5    10

	describe('constructor', function() {
		it('throws with no arguments', function() {
			expect(function() {
				new ComplementLocation()
			}).throw(Error)
		})

		it('valid location works', function() {
			let location = new Location(new LocationPoint(1), new LocationPoint(3))
			new ComplementLocation(location)
		})
	})

	describe('transcriptFrom', function() {
		describe('linear sequence', function() {
			it('1..3', function() {
				let location = new Location(new LocationPoint(1), new LocationPoint(3)),
					x = new ComplementLocation(location),
					result = x.transcriptFrom(seq)

				expect(result).instanceof(Seq)
				expect(result.sequence()).equal('GAT')
			})
		})

		describe('circular sequence', function() {
			let circularSeq = new Seq(seq.sequence()).setCircular()

			it('1..3', function() {
				let location = new Location(new LocationPoint(1), new LocationPoint(3)),
					x = new ComplementLocation(location),
					result = x.transcriptFrom(circularSeq)

				expect(result.isCircular()).false
				expect(result.sequence()).equal('GAT')
			})

			it('9..2', function() {
				let location = new Location(new LocationPoint(9), new LocationPoint(2)),
					x = new ComplementLocation(location),
					result = x.transcriptFrom(circularSeq)

				expect(result.isCircular()).false
				expect(result.sequence()).equal('ATCG')
			})
		})
	})
})
