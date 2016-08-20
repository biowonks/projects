/* eslint-disable no-mixed-requires, no-unused-expressions, no-magic-numbers */

'use strict'

// Core
let path = require('path')

// Local
let TaxonomyService = require('./TaxonomyService'),
	testResults = require(path.resolve(__dirname, 'test-data', 'taxonomyService.test.results.js')),
	models = require('../../../models').withDummyConnection(),
	mutil = require('../mutil')

// Constants
const kSampleXMLFileSpecies = path.resolve(__dirname, 'test-data', '476210_species.test.xml'),
	kSampleXMLFileIntermediate = path.resolve(__dirname, 'test-data', '41253_intermediate.test.xml')

describe('Services', function() {
	describe.only('TaxonomyService', function() {
		let taxonomyService = new TaxonomyService(models.Taxonomy)

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
					let taxonomyId = fixture

					return taxonomyService.fetchFromNCBI(taxonomyId)
					.then((result) => {
						expect(result).eql(testResults.kSampleXMLFileIntermediate)
					})
				})
			})

			it('nock tests')
		})

		describe('updateTaxonomy', function() {

		})

		describe('parseNCBITaxonomyXML', function() {

		})

		describe('reshapeNCBITaxonomy', function() {
			it('species XML', function() {
				return mutil.readFile(kSampleXMLFileSpecies)
				.then((xml) => mutil.xmlToJs(xml))
				.then((ncbiTaxonomy) => taxonomyService.reshapeNCBITaxonomy(ncbiTaxonomy))
				.then((result) => {
					expect(result).eql(testResults.kSampleXMLFileSpecies)
				})
			})

			it('intermediate rank XML', function() {
				return mutil.readFile(kSampleXMLFileIntermediate)
				.then((xml) => mutil.xmlToJs(xml))
				.then((ncbiTaxonomy) => taxonomyService.reshapeNCBITaxonomy(ncbiTaxonomy))
				.then((result) => {
					expect(result).eql(testResults.kSampleXMLFileIntermediate)
				})
			})
		})


		describe('taxonomyId2finalTaxonomyObject', function() {
		})
	})
})

