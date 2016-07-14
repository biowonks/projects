/* eslint-disable no-mixed-requires */

'use strict'

// Local
const models = require('./index').withDummyConnection()

// Other
const Aseq = models.Aseq

describe('models', function() {
	describe('Aseq', function() {
		describe('toolIdFieldNames', function() {
			it('returns a list of supported tool ids', function() {
				expect(Aseq.toolIdFieldNames()).members(['pfam30', 'segs', 'coils'])
			})
		})
	})
})
