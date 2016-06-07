/* eslint-disable no-unused-expressions, no-mixed-requires */

'use strict'

// Core
let path = require('path'),
	url = require('url')

// Vendor
let nock = require('nock')

// Local
let mutil = require('../mutil'),
	TaxonomyService = require('./TaxonomyService')

// Constants
let kSampleXMLFile = path.resolve(__dirname, 'test-data', 'sample-taxonomy2.xml')

describe('Services', function() {
	describe('TaxonomyService', function() {
		let taxonomyService = new TaxonomyService()

		function urlNockParts(sourceUrl) {
			let parts = url.parse(sourceUrl, true /* parseQueryString */)

			return {
				baseUrl: parts.protocol + '//' + parts.host,
				pathName: parts.pathname,
				query: parts.query
			}
		}

		describe('eutilUrl', function() {
			it('returns taxonomyId appended', function() {
				let taxonomyId = 123
				expect(/123$/.test(taxonomyService.eutilUrl(taxonomyId))).true
			})
		})

		describe('fetch', function() {
			let sampleTaxonomyXml = null
			before(() => {
				return mutil.readFile(kSampleXMLFile)
				.then((xml) => {
					sampleTaxonomyXml = xml
				})
			})

			it('undefined taxonomicId returns rejected promise', function() {
				return expectRejection(taxonomyService.fetch())
			})

			it('invalid numeric taxonomicId throws error', function() {
				return expectRejection(taxonomyService.fetch('ab123'))
			})

			let taxonomyIdString = '41253',
				taxonomyIdInteger = 41253,
				taxonomyIds = [taxonomyIdString, taxonomyIdInteger]
			taxonomyIds.forEach((taxonomyId) => {
				it(`${taxonomyId} (${typeof taxonomyId}) works`, function() {
					let eutilUrl = taxonomyService.eutilUrl(taxonomyId),
						urlParts = urlNockParts(eutilUrl),
						nockEutilRequest = nock(urlParts.baseUrl),
						// eslint-disable-next-line global-require
						expectedResult = require('./test-data/sample-taxonomy2')

					nockEutilRequest
						.get(urlParts.pathName)
						.query(urlParts.query)
						.reply(200, sampleTaxonomyXml) // eslint-disable-line no-magic-numbers

					return taxonomyService.fetch(taxonomyId)
					.then((taxonomyResult) => {
						nockEutilRequest.done()
						expect(taxonomyResult).deep.equal(expectedResult)
					})
				})
			})
		})

		describe('taxonomicGroup', function() {
			it('non-proteobacteria phylum returns phylum', function() {
				expect(taxonomyService.taxonomicGroup('Chlorobi', 'Chlorobia')).equal('Chlorobi')
			})

			it('Proteobacteria phylum returns class', function() {
				expect(taxonomyService.taxonomicGroup('Proteobacteria', 'Zetaproteobacteria')).equal('Zetaproteobacteria')
			})

			it('prOteobacteriA case returns class', function() {
				expect(taxonomyService.taxonomicGroup('prOteobacteriA', 'Zetaproteobacteria')).equal('Zetaproteobacteria')
			})
		})
	})
})

