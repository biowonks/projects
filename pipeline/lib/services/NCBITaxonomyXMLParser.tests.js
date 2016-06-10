/* eslint-disable no-unused-expressions, no-magic-numbers */
'use strict'

// Core includes
let path = require('path')

// Local includes
let mutil = require('../mutil'),
	NCBITaxonomyXMLParser = require('./NCBITaxonomyXMLParser')

// Constants
const kSampleXMLFile1 = path.resolve(__dirname, 'test-data', 'sample-taxonomy1.xml'),
	kSampleXMLFile2 = path.resolve(__dirname, 'test-data', 'sample-taxonomy2.xml'),
	kInvalidSampleXMLFile1 = path.resolve(__dirname, 'test-data', 'invalid-taxonomy.xml')

describe('Services', function() {
	describe('NCBITaxonomyXMLParser', function() {
		describe('parse', function() {
			let ncbiTaxonomyXMLParser = new NCBITaxonomyXMLParser()
			it('empty XML throws error', function() {
				return expectRejection(ncbiTaxonomyXMLParser.parse(''))
			})

			it('invalid XML throws error', function() {
				let promise = mutil.readFile(kInvalidSampleXMLFile1)
				.then((xml) => ncbiTaxonomyXMLParser.parse(xml))

				return expectRejection(promise)
			})

			it('species XML', function() {
				return mutil.readFile(kSampleXMLFile1)
				.then((xml) => ncbiTaxonomyXMLParser.parse(xml))
				.then((result) => {
					expect(result).deep.equal({
						taxonomyId: 476210,
						organism: 'Borrelia burgdorferi 118a',
						lineage: [
							'cellular organisms',
							'Bacteria',
							'Spirochaetes',
							'Spirochaetia',
							'Spirochaetales',
							'Borreliaceae',
							'Borreliella',
							'Borreliella burgdorferi'
						],
						lineageTaxonomyIds: [
							131567,
							2,
							203691,
							203692,
							136,
							1643685,
							64895,
							139
						],
						superkingdom: 'Bacteria',
						kingdom: null,
						phylum: 'Spirochaetes',
						class: 'Spirochaetia',
						order: 'Spirochaetales',
						family: 'Borreliaceae',
						genus: 'Borreliella',
						species: 'Borreliella burgdorferi',
						strain: '118a'
					})
				})
			})

			it('intermediate rank XML', function() {
				// eslint-disable-next-line global-require
				let expectedResult = require('./test-data/sample-taxonomy2')

				return mutil.readFile(kSampleXMLFile2)
				.then((xml) => ncbiTaxonomyXMLParser.parse(xml))
				.then((result) => {
					expect(result).deep.equal(expectedResult)
				})
			})
		})
	})
})
