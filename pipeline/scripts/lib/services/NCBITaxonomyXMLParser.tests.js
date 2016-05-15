'use strict'

let NCBITaxonomyXMLParser = require('./NCBITaxonomyXMLParser'),
	NCBITaxonomyXMLParserResults = require('./test-data/NCBITaxonomyXMLParser.test.results'),
	path = require('path')


const kSampleXMLFile1 = path.resolve(__dirname, 'test-data', 'NCBITaxonomyXMLParser.test.1.xml'),
	kSampleXMLFile2 = path.resolve(__dirname, 'test-data', 'NCBITaxonomyXMLParser.test.2.xml'),
	kInvalidSampleXMLFile1 = path.resolve(__dirname, 'test-data', 'NCBITaxonomyXMLParser.test.1.invalid.xml'),
	kEmptySampleXMLFile1 = path.resolve(__dirname, 'test-data', 'NCBITaxonomyXMLParser.test.1.empty.xml')

describe('Services', function() {
	describe('NCBITaxonomyXMLParser', function() {
		describe('parse', function() {
			it('empty XML throws error', function() {
				let ncbiTaxonomyXMLParser = new NCBITaxonomyXMLParser(),
					succeded = null
				return ncbiTaxonomyXMLParser.getTaxonomy(kEmptySampleXMLFile1)
					.then(() => {
						succeded = true
					})
					.catch(() => {
						succeded = false
					})
					.finally(() => {
						expect(succeded).false
					})
			})

			it('invalid XML throws error', function() {
				let ncbiTaxonomyXMLParser = new NCBITaxonomyXMLParser(),
					succeded = null
				return ncbiTaxonomyXMLParser.getTaxonomy(kInvalidSampleXMLFile1)
					.then(() => {
						succeded = true
					})
					.catch(() => {
						succeded = false
					})
					.finally(() => {
						expect(succeded).false
					})
			})

			it('species XML', function() {
				let ncbiTaxonomyXMLParser = new NCBITaxonomyXMLParser()
				return ncbiTaxonomyXMLParser.getTaxonomy(kSampleXMLFile1)
					.then((result) => {
						expect(result).deep.equal(NCBITaxonomyXMLParserResults.sampleXMLFileResults1)
					})
			})

			it('intermediate rank XML', function() {
				let ncbiTaxonomyXMLParser = new NCBITaxonomyXMLParser()
				return ncbiTaxonomyXMLParser.getTaxonomy(kSampleXMLFile2)
					.then((result) => {
						expect(result).deep.equal(NCBITaxonomyXMLParserResults.sampleXMLFileResults2)
					})
			})
		})
	})
})
