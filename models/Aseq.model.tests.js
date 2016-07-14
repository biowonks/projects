/* eslint-disable no-mixed-requires */

'use strict'

// Local
const models = require('./index').withDummyConnection(),
	AseqModelFn = require('./Aseq.model.js')

// Other
const Aseq = models.Aseq

describe('models', function() {
	describe('Aseq', function() {
		describe('kToolIdFieldNames (static property)', function() {
			it('returns a list of supported tool ids', function() {
				expect(AseqModelFn.kToolIdFieldNames).members(['pfam30', 'segs', 'coils'])
			})
		})

		describe('toolIdFieldNames', function() {
			it('returns a list of supported tool ids', function() {
				expect(Aseq.toolIdFieldNames()).members(['pfam30', 'segs', 'coils'])
			})
		})
	})
})
