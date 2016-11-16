/* eslint-disable no-magic-numbers */

'use strict'

// Vendor
const httpMocks = require('node-mocks-http')

// Local
const RouteHelper = require('./RouteHelper')

describe('RouteHelper', function() {
	describe('linkHeaders', function() {
		let x = null,
			req = null
		before(() => {
			x = new RouteHelper(null)
			req = httpMocks.createRequest({
				method: 'GET',
				url: '/genomes'
			})
		})

		it('base route without any count, page, or per_page returns only the "first" link', function() {
			let result = x.linkHeaders(req, null, null, null)
			expect(result).members([
				'</genomes>; rel="first"'
			])
		})

		it('invalid offset, invalid limit only returns the "first" link', function() {
			let offset = -1,
				limit = -1,
				result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"'
			])
		})

		it('valid offset, invalid limit only returns the "first" link', function() {
			let offset = 5,
				limit = -1,
				result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"'
			])
		})

		it('invalid offset, valid limit only returns the "first" link', function() {
			let offset = -1,
				limit = 5,
				result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"'
			])
		})

		it('valid offset, valid limit, no total count first page only returns the "first" link', function() {
			let offset = 0,
				limit = 5,
				result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"'
			])

			offset = limit - 1
			result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"'
			])
		})

		it('valid offset, valid limit, invalid total count on first page only returns the "first" link', function() {
			let offset = 0,
				limit = 5,
				totalCount = -1,
				result = x.linkHeaders(req, offset, limit, totalCount)
			expect(result).members([
				'</genomes>; rel="first"'
			])

			offset = limit - 1
			result = x.linkHeaders(req, offset, limit, totalCount)
			expect(result).members([
				'</genomes>; rel="first"'
			])
		})

		it('valid offset, valid limit, no total count on non-initial page returns the "first", "prev" links', function() {
			let limit = 5,
				offset = limit,
				result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes>; rel="prev"'
			])

			offset = limit * 2
			result = x.linkHeaders(req, offset, limit)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes?page=2>; rel="prev"'
			])
		})

		it('valid input, first page and only one page of results', function() {
			let offset = 0,
				limit = 10,
				total = 5,
				result = x.linkHeaders(req, offset, limit, total)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes>; rel="last"'
			])
		})

		it('valid input, first page, multiple pages of results', function() {
			let offset = 0,
				limit = 10,
				total = limit + 1,
				result = x.linkHeaders(req, offset, limit, total)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes?page=2>; rel="next"',
				'</genomes?page=2>; rel="last"'
			])
		})

		it('valid input, first page, multiple pages of results', function() {
			let offset = 0,
				limit = 10,
				total = limit + 1,
				result = x.linkHeaders(req, offset, limit, total)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes?page=2>; rel="next"',
				'</genomes?page=2>; rel="last"'
			])
		})

		it('valid input, on second page, 4 pages of results', function() {
			let limit = 10,
				offset = limit,
				total = (limit * 3) + 1,
				result = x.linkHeaders(req, offset, limit, total)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes?page=3>; rel="next"',
				'</genomes?page=4>; rel="last"',
				'</genomes>; rel="prev"'
			])
		})

		it('valid input, on third page, 5 pages of results', function() {
			let limit = 10,
				offset = limit * 2,
				total = (limit * 4) + 1,
				result = x.linkHeaders(req, offset, limit, total)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes?page=4>; rel="next"',
				'</genomes?page=5>; rel="last"',
				'</genomes?page=2>; rel="prev"'
			])
		})

		it('valid input, on last page, 5 pages of results, no "next"', function() {
			let limit = 10,
				offset = limit,
				total = limit + 1,
				result = x.linkHeaders(req, offset, limit, total)
			expect(result).members([
				'</genomes>; rel="first"',
				'</genomes?page=2>; rel="last"',
				'</genomes>; rel="prev"'
			])
		})
	})
})
