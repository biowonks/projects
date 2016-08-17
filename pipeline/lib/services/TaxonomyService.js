'use strict'

// Vendor
let Promise = require('bluebird'),
	requestPromise = require('request-promise')

// Local
let NCBITaxonomyXMLParser = require('./NCBITaxonomyXMLParser'),
	mutil = require('../mutil')

// Constants
const kNCBIPartialTaxonomyUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&retmode=text&rettype=xml&id=',
	kNCBIRootTaxonomyId = 1

class IntermediateRankExistsError extends Error {
}

/**
 * @constructor
 */
module.exports =
class TaxonomyService {
	/**
	 * @constructor
	 * @param {Model} taxonomyModel
	 */
	constructor(taxonomyModel, logger) {
		this.taxonomyModel_ = taxonomyModel
		this.logger_ = logger
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
		.then((xmlResponse) => mutil.xmlToJs(xmlResponse))
		.then((jsonTaxonomy) => this.taxonomyXMLParser_.ncbiTaxonomyObject2mistTaxonomyObject(jsonTaxonomy))
	}

	// eslint-disable-next-line valid-jsdoc
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
	 * @param {int} taxonomyId
	 * It fetches taxonomy information from NCBI and inserts the taxonomyNode in Taxonomy table
	 * @returns {Promise} taxonomyObject with id, name, rank, parent
	 */
	fetchMissingTaxonomyAndSaveAssociatedNodes(taxonomyId) {
		return this.nodeDoesNotExist_(taxonomyId)
		.then((doesntExist) => {
			if (doesntExist)
				return this.fetchTaxonomyAndSaveNodes_(taxonomyId)

			return null
		})
	}

	/**
	 * @param {Number} taxonomyId - NCBI taxonomy id
	 * @param {Transaction} transaction
	 * @returns {Promise} with resolve as boolean true if the give node Taxonomy ID doesn't exist in the taxonomy table
	 */
	nodeDoesNotExist_(taxonomyId, transaction) {
		return this.taxonomyModel_.find({
			where: {
				id: taxonomyId
			},
			transaction
		})
		.then((taxonomyRow) => {
			return !taxonomyRow
		})
	}

	fetchTaxonomyAndSaveNodes_(taxonomyId) {
		return this.fetch(taxonomyId)
		.then((ncbiTaxonomy) => {
			ncbiTaxonomy.lineage.reverse()

			return Promise.each(ncbiTaxonomy.lineage, (taxonomyNode, i) => {
				taxonomyNode.parent_taxonomy_id = kNCBIRootTaxonomyId
				let hasParent = i !== (ncbiTaxonomy.lineage.length - 1)
				if (hasParent)
					taxonomyNode.parent_taxonomy_id = ncbiTaxonomy.lineage[i + 1].id

				return this.insertTaxonomyNode_(taxonomyNode)
			})
			.catch(IntermediateRankExistsError, () => {})
			.then(() => ncbiTaxonomy)
		})
	}

	insertTaxonomyNode_(taxonomyNode) {
		return this.taxonomyModel_.sequelize.transaction((transaction) => {
			return this.nodeDoesNotExist_(taxonomyNode.id, transaction)
			.then((doesntExist) => {
				let doesExist = !doesntExist
				// No need iterate insertion check for parents. If the node already exists, its parents must exist as well.
				if (doesExist)
					throw new IntermediateRankExistsError()

				return this.taxonomyModel_.create(taxonomyNode, {transaction})
				.then((dbTaxonomyNode) => {
					this.logger_.info(dbTaxonomyNode.get(), `Inserted new taxonomy node: ${dbTaxonomyNode.name}`)
				})
			})
		})
	}
}
