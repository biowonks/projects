'use strict'

// 3rd-party libraries
let Promise = require('bluebird'),
	requestPromise = require('request-promise')

// Local includes
let NCBITaxonomyXMLParser = require('./NCBITaxonomyXMLParser'),
	BootService = require('../../services/BootService')

// Constants
const kNCBIPartialTaxonomyUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&retmode=text&rettype=xml&id='

/**
 * @constructor
 */
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
	
	 /**
     * @param {number} taxonomyId numeric identifier
     * @returns {boolean} true if the give node Taxonomy ID doesn't exist in the taxonomy table
     */
    nodeDoesNotExist_(taxonomyId) {
		return this.bootService_.setup()
		.then(() => {
			this.sequelize_ = this.bootService_.sequelize()
			this.models_ = this.bootService_.models()
		})
		.then(() => {
			return this.models_.taxonomy.find({
				where: {
					id: taxonomyId
				}
        	})
		})
        .then((taxonomyRow) => {
        	return !!taxonomyRow  
        )}
	}
	
	writeNodeToFile_(node) {
		//TO DO
	}
	
	updateTable(taxonomyId) {
        return this.nodeDoesNotExist_()
        .then((doesntExist) => {
            this.fetch(taxonomyId)
            .then((taxonomyObject) => {
                for (let i = taxonomyObject.lineage.length(); i >= 0 ; i--) {
                    let node = taxonomyObject.lineage[i]
                    node.parentTaxonomyId = 1
                    node.hasParent: (i !== 0)

                    if (this.nodeDoesNotExist_(nodeTaxonomyId)) {
                        if (node.hasParent) {
                            node.parentTaxonomyId = taxonomyObject.lineage[i - 1].id
                        }
                        this.writeNodeToFile_(node)
                    }
                    else {
                        break //No need iterate insertion check for parents. If the node already exists, its parents must exist as well.
                    }
                }
            })
        })
    }

}
