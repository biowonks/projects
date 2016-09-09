/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Core
const path = require('path'),
	url = require('url')

// Vendor
const nock = require('nock')

// Local
const TaxonomyService = require('./TaxonomyService'),
	testResults = require('./test-data/taxonomyService.test.results'),
	models = require('../models').withDummyConnection(),
	mutil = require('../mutil')

// Constants
const kSampleXMLFileSpecies = path.resolve(__dirname, 'test-data', '476210_species.test.xml'),
	kSampleXMLFileIntermediate = path.resolve(__dirname, 'test-data', '41253_intermediate.test.xml')

describe('Services', function() {
	describe('TaxonomyService', function() {
		let taxonomyService = new TaxonomyService(models.Taxonomy),
			speciesXML = null,
			intermediateXML = null

		before(() => {
			return mutil.readFile(kSampleXMLFileSpecies)
			.then((xml) => {
				speciesXML = xml
				return mutil.readFile(kSampleXMLFileIntermediate)
			})
			.then((xml) => {
				intermediateXML = xml
			})
		})

		describe('eutilUrl', function() {
			it('returns taxonomyId appended', function() {
				let taxonomyId = 123
				expect(/123$/.test(taxonomyService.eutilUrl(taxonomyId))).true
			})
		})

		describe('fetchFromNCBI', function() {
			it('undefined taxonomicId throws error', function() {
				return expectRejection(taxonomyService.fetchFromNCBI())
			})

			it('invalid numeric taxonomicId throws error', function() {
				return expectRejection(taxonomyService.fetchFromNCBI('ab123'))
			})

			let fixtures = ['41253', 41253]
			fixtures.forEach((fixture) => {
				it(fixture + ' (' + typeof fixture + ') works', function() {
					let taxonomyId = fixture,
						nockUrl = taxonomyService.eutilUrl(taxonomyId),
						parsedUrl = url.parse(nockUrl),
						ncbiTaxonomyNock = nock(parsedUrl.protocol + '//' + parsedUrl.host)
							.get(parsedUrl.path)
							.reply(200, intermediateXML)

					return taxonomyService.fetchFromNCBI(taxonomyId)
					.then((result) => {
						ncbiTaxonomyNock.done()
						expect(result).eql(testResults.kSampleXMLFileIntermediate)
					})
				})
			})
		})

		describe('updateTaxonomy', function() {

		})

		describe('reshapeNCBITaxonomy', function() {
			it('species XML', function() {
				return mutil.xmlToJs(speciesXML)
				.then((ncbiTaxonomy) => taxonomyService.reshapeNCBITaxonomy(ncbiTaxonomy))
				.then((result) => {
					expect(result).eql(testResults.kSampleXMLFileSpecies)
				})
			})

			it('intermediate rank XML', function() {
				return mutil.xmlToJs(intermediateXML)
				.then((ncbiTaxonomy) => taxonomyService.reshapeNCBITaxonomy(ncbiTaxonomy))
				.then((result) => {
					expect(result).eql(testResults.kSampleXMLFileIntermediate)
				})
			})
		})
	})
})
