'use strict'

describe.only('Feature Query Language - FQL', function() {
	describe('single domains', function() {
		it('requesting single domain from pfam29', function() {
			let queryJson = [{
				db: 'pfam29',
				in: [
					'CheW'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("SELECT _id FROM pfam29 WHERE 'CheW' in domains")
		})
		it('requesting two domains from same resource')
	})
})


// | feature | db | [aseqs]

