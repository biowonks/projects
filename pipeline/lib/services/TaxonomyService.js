'use strict'

// Vendor
let Promise = require('bluebird'),
	requestPromise = require('request-promise')

// Local
let mutil = require('../mutil')

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
	 * @param {class} logger
	 */
	constructor(taxonomyModel, logger) {
		this.taxonomyModel_ = taxonomyModel
		this.logger_ = logger
	}

	eutilUrl(taxonomyId) {
		return kNCBIPartialTaxonomyUrl + taxonomyId
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
		return this.taxonomyId2finalTaxonomyObject(taxonomyId)
		.then((finalTaxonomy) => {
			finalTaxonomy.lineage.reverse()

			return Promise.each(finalTaxonomy.lineage, (taxonomyNode, i) => {
				taxonomyNode.parent_taxonomy_id = kNCBIRootTaxonomyId
				let hasParent = i !== (finalTaxonomy.lineage.length - 1)
				if (hasParent)
					taxonomyNode.parent_taxonomy_id = finalTaxonomy.lineage[i + 1].id

				return this.insertTaxonomyNode_(taxonomyNode)
			})
			.catch(IntermediateRankExistsError, () => {})
			.then(() => finalTaxonomy)
		})
	}

	/**
	 * @param {number} taxonomyId numeric identifier
	 * @returns {Promise} resolves with an object describing the taxonomy
	 */
	taxonomyId2finalTaxonomyObject(taxonomyId) {
		if (!/^\d+$/.test(taxonomyId))
			return Promise.reject(new Error('Invalid taxonomy id - must be all digits'))
		return requestPromise(this.eutilUrl(taxonomyId))
		.then((xmlResponse) => mutil.xmlToJs(xmlResponse))
		.then((jsonTaxonomy) => this.ncbiTaxonomyObject2finalTaxonomyObject(jsonTaxonomy))
	}

	/**
	 * @param {Object} ncbiTaxonomy Object derived from XML
	 * @returns {Object}
	 * 	{
	 *		lineage: [ // Full lineage list with node id, name and rank
	 *			{
					id: 131567,
					name: 'cellular organisms',
					rank: 'no rank'
				},
				{
					id: 2,
					name: 'Bacteria',
					rank: 'superkingdom'
				}...
			]
	 *
	 *		superkingdom
	 *		kingdom
	 *		phylum
	 *		class
	 *		order
	 *		family
	 *		genus
	 *		species
	 *		strain
	 *	}
	 */
	ncbiTaxonomyObject2finalTaxonomyObject(ncbiTaxonomy) {
		let taxonomyObject = {
				taxid: null,
				organism: null,
				lineage: [],
				superkingdom: null,
				kingdom: null,
				phylum: null,
				class: null,
				order: null,
				family: null,
				genus: null,
				species: null,
				strain: null
			},
			taxon = ncbiTaxonomy.TaxaSet.Taxon[0],
			currentNode = {
				id: parseInt(taxon.TaxId[0]),
				name: taxon.ScientificName[0],
				rank: taxon.Rank[0]
			},
			rankObjects = taxon.LineageEx[0].Taxon

		taxonomyObject.taxid = parseInt(taxon.TaxId[0])
		taxonomyObject.organism = taxon.ScientificName[0]


		rankObjects.forEach((rankObject) => {
			let node = {
				id: parseInt(rankObject.TaxId[0]),
				name: rankObject.ScientificName[0],
				rank: rankObject.Rank[0]
			}
			taxonomyObject.lineage.push(node)
			if (taxonomyObject[node.rank] === null)
				taxonomyObject[node.rank] = node.name
		})

		taxonomyObject.lineage.push(currentNode)
		if (taxonomyObject[currentNode.rank] === null)
			taxonomyObject[currentNode.rank] = currentNode.name

		let numberOfWordsInSpecies = 2
		if (taxonomyObject.species !== null) {
			taxonomyObject.strain = taxonomyObject.organism.split(/\s+/g).slice(numberOfWordsInSpecies)
			.join(' ')
			.trim()
		}

		return taxonomyObject
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
