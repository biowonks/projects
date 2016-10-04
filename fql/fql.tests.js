'use strict'

describe.only.exact('Feature Query Language - FQL', function() {
	describe('unordered searches', function() {
		it('requesting sequences with a match of at least one region to one domain from pfam29 in any order', function() {
			let queryJson = [{
				resource: 'pfam29',
				mode: 'any',
				in: [
					'CheW'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("...CheA, CheW, CheV, 2xCheW, 3xCheW and etc")
		})
		it('requesting sequences with a match of at least two regions to the same domain from pfam29 in any order', function() {
			let queryJson = [{
				resource: 'pfam29',
				mode: 'any',
				in: [
					'CheW', 'CheW'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("... 2xCheW, 3xCheW")
		})
		it('requesting sequences with a match of two regions, one to each domain from pfam29 in any order', function() {
			let queryJson = [{
				resource: 'pfam29',
				mode: 'any',
				in: [
					'CheW', 'RR'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("...CheV, CheA, RR-CheW...")
		})
		it('requesting sequences with a match of at least one transmembrane region from DAS anywhere in the sequence', function() {
			let queryJson = [{
				resource: 'das',
				mode: 'any',
				in: [1]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("...CheA, CheW, CheV, 2xCheW, 3xCheW and etc")
		})
		it('requesting sequences with a match of at least one transmembrane region from DAS anywhere in the sequence', function() {
			let queryJson = [{
				resource: 'das',
				mode: 'any',
				in: [1]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("...CheA, CheW, CheV, 2xCheW, 3xCheW and etc")
		})
	})
	describe('excludent searches', function() {
		it('requesting sequences with a match of exact one region to one domains from pfam29 in any order', function() {
			let queryJson = [{
				resource: 'pfam29',
				mode: 'exact',
				in: [
					'CheW'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("...CheW, ParP...")
		})
		it('requesting sequences with a match of exact two regions to the same domain from pfam29 in any order', function() {
			let queryJson = [{
				resource: 'pfam29',
				mode: 'exact',
				in: [
					'CheW', 'CheW'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("... 2xCheW")
		})
		it('requesting sequences exact with a match of two regions, one to each domain from pfam29 in any order', function(){
			let queryJson = [{
				resource: 'pfam29',
				mode: 'exact',
				in: [
					'CheW', 'RR'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("... ... CheW-RR, CheV")
		})
	})
	describe('Combinations: OR, AND', function() {})
	describe('ordered searches', function() {})
	describe('errors', function() {
		it('requesting feature from non-existent resource should throw error and return available resources', function() {
			let queryJson = [{
				resource: 'xxxxx',
				mode: 'any',
				in: [
					'CheW'
				]
			}]
			let result = buildQuery(queryJson)
			expect(result).equal("...ERROR")
		})
		it('requesting AND combination in mode exact should throw error', function() {
			let queryJson = [{}]
			let result = buildQuery(queryJson)
			expect(result).equal("...ERROR")
		})
	})
	describe('bonus functionality', function() {
		it('return should always contain input', function() {})
	})
})


// | feature | db | [aseqs]
