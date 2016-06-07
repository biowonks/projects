'use strict'

// 3rd-party libraries
let Promise = require('bluebird'),
	requestPromise = require('request-promise')

// Local includes
let NCBITaxonomyXMLParser = require('./NCBITaxonomyXMLParser')

// Constants
const kNCBIPartialTaxonomyUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&retmode=text&rettype=xml&id='

module.exports =
class TaxonomyService {
	constructor() {
		this.taxonomyXMLParser_ = new NCBITaxonomyXMLParser()
	}

	eutilUrl(taxonomyId) {
		return kNCBIPartialTaxonomyUrl + taxonomyId
	}

	/**
	 * @param {number} taxonomyId numeric identifier
	 * @returns {Promise} resolves with an object describing the taxonomy
	 */
	fetch(taxonomyId) {
		if (!/^\d+$/.test(taxonomyId))
			return Promise.reject(new Error('Invalid taxonomy id - must be all digits'))

		return requestPromise(this.eutilUrl(taxonomyId))
		.then((xmlResponse) => {
			return this.taxonomyXMLParser_.parse(xmlResponse)
		})
	}

	// eslint-disable-next-line
	/**
	 * Given the phylum and class, return the major taxonomic group. In most cases,
	 * this is simply the phlum; however, the class should be returned if the phylum
	 * is proteobacteria (case insensitive) because the proteobacteria phylum is so
	 * large and diverse.
	 *
	 * @param {string} phylum organism's phylum
	 * @param {string} classs organism's class (intentionally mispelled to avoid keyword)
	 * @returns {string} the major taxnomic group
	 */
	taxonomicGroup(phylum, classs) {
		throw new Error('Not yet implemented')
	}
}
