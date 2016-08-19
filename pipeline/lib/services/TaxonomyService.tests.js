/* eslint-disable no-unused-expressions */

'use strict'

// 3rd party includes
let path = require('path')

// Local includes
let TaxonomyService = require('./TaxonomyService'),
	testResults = require(path.resolve(__dirname, 'test-data', 'taxonomyService.test.results.js')),
	mutil = require('../mutil')

const kSampleXMLFileSpecies = path.resolve(__dirname, 'test-data', '476210_species.test.xml'),
	kSampleXMLFileIntermediate = path.resolve(__dirname, 'test-data', '41253_intermediate.test.xml')


describe('Services', function() {
	describe('TaxonomyService', function() {
		let taxonomyService = new TaxonomyService()

		describe('eutilUrl', function() {
			it('returns taxonomyId appended', function() {
				let taxonomyId = 123
				expect(/123$/.test(taxonomyService.eutilUrl(taxonomyId))).true
			})
		})

		describe('taxonomyId2finalTaxonomyObject', function() {
			it('undefined taxonomicId throws error', function() {
				taxonomyService.taxonomyId2finalTaxonomyObject()
				.then((result) => {
					expect(() => {}).throw(Error)
				})
			})


			it('invalid numeric taxonomicId throws error', function() {
				taxonomyService.taxonomyId2finalTaxonomyObject('ab123')
				.then((result) => {
					expect(() => {}).throw(Error)
				})
			})
		})

		describe('taxonomyId2finalTaxonomyObject', function() {
			it('species XML', function() {
				return mutil.readFile(kSampleXMLFileSpecies)
					.then((xmlString) => mutil.xmlToJs(xmlString))
					.then((jsonTaxonomy) => taxonomyService.ncbiTaxonomyObject2finalTaxonomyObject(jsonTaxonomy))
					.then((result) => {
						expect(result).deep.equal(testResults.kSampleXMLFileSpecies)
					})
			})

			it('intermediate rank XML', function() {
				return mutil.readFile(kSampleXMLFileIntermediate)
					.then((xmlString) => mutil.xmlToJs(xmlString))
					.then((jsonTaxonomy) => taxonomyService.ncbiTaxonomyObject2finalTaxonomyObject(jsonTaxonomy))
					.then((result) => {
						expect(result).deep.equal(testResults.kSampleXMLFileIntermediate)
					})
			})

			let fixtureString = '41253',
				fixtureInteger = 41253,
				fixtures = [fixtureString, fixtureInteger]
			fixtures.forEach((fixture) => {
				it(fixture + ' (' + typeof fixture + ') works', function() {
					let taxonomyId = fixture

					return taxonomyService.taxonomyId2finalTaxonomyObject(taxonomyId)
						.then((taxonomyResult) => {
							expect(taxonomyResult).deep.equal(testResults.kSampleXMLFileIntermediate)
						})
				})
			})
		})
	})
})

