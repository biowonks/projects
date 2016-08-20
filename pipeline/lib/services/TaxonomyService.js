'use strict'

// Vendor
const Promise = require('bluebird'),
	requestPromise = require('request-promise')

// Local
const mutil = require('../mutil')

// Constants
const kNCBIPartialTaxonomyUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&retmode=text&rettype=xml&id=',
	kNCBIRootTaxonomyId = 1, // Absolute root taxonomic node defined by NCBI
	kNumberOfWordsInSpecies = 2

/**
 * Private error used for indicating that a given taxonomic node already exists and breaking out of
 * a Promise.each chain.
 */
class IntermediateRankExistsError extends Error {}

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

	/**
	 * @param {Number} taxonomyId - NCBI taxonomy identifier
	 * @returns {String} - NCBI URL for fetching the XML taxonomy
	 */
	eutilUrl(taxonomyId) {
		return kNCBIPartialTaxonomyUrl + taxonomyId
	}

	/**
	 * @param {Number} taxonomyId - NCBI taxonomy identifier
	 * @returns {Promise} resolves with an object describing the taxonomy
	 */
	// taxonomyId2finalTaxonomyObject(taxonomyId) {
	fetchFromNCBI(taxonomyId) {
		if (!/^[1-9]\d*$/.test(taxonomyId))
			return Promise.reject(new Error('invalid taxonomy id: must be positive integer'))

		let url = this.eutilUrl(taxonomyId)
		return requestPromise(url)
		.then(this.parseNCBITaxonomyXML.bind(this))
		// .then((xmlResponse) => mutil.xmlToJs(xmlResponse))
		// .then((ncbiTaxonomy) => this.reshapeNCBITaxonomy(ncbiTaxonomy))
	}

	/**
	 * If the node corresponding to ${taxonomyId} does not exist, fetch the full taxonomy
	 * information from NCBI and upsert any missing taxonomic nodes.
	 *
	 * @param {Number} taxonomyId - NCBI taxonomy identifier
	 * @returns {Promise} taxonomyObject with id, name, rank, parent
	 */
	updateTaxonomy(taxonomyId) {
		return this.nodeExists_(taxonomyId)
		.then((nodeExists) => {
			if (nodeExists)
				return null // TODO: Fetch taxonomy from taxonomy table and return here

			return this.fetchFromNCBI(taxonomyId)
			.then((rawTaxonomy) => {
				return Promise.each(rawTaxonomy.lineage, this.insertNodeIfNew_.bind(this))
				.catch(IntermediateRankExistsError, () => {}) // noop, helps break out of the each loop
				.then(() => rawTaxonomy)
			})
		})
	}

	/**
	 * @param {String} xml - NCBI Taxonomy XML report
	 * @returns {Promise.<Object>} - reshaped taxonomy
	 */
	parseNCBITaxonomyXML(xml) {
		return mutil.xmlToJs(xml)
		.then((ncbiTaxonomy) => this.reshapeNCBITaxonomy(ncbiTaxonomy))
	}

	/**
	 * @param {Object} ncbiTaxonomy object representation of the NCBI taxonomy XML
	 * @returns {Object}
	 * 	{
	 *	  lineage: [ // Full lineage list with node id, name and rank
	 *	    {
	 *        id: 131567,
	 *        name: 'cellular organisms',
	 *        rank: 'no rank'
	 *      },
	 *      {
	 *        id: 2,
	 *        name: 'Bacteria',
	 *        rank: 'superkingdom'
	 *      },
	 *      ...
	 *    ],
	 *    superkingdom,
	 *    kingdom,
	 *    phylum,
	 *    class,
	 *    order,
	 *    family,
	 *    genus,
	 *    species,
	 *    strain
	 *	}
	 */
	reshapeNCBITaxonomy(ncbiTaxonomy) {
		let result = {
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
				id: Number(taxon.TaxId[0]),
				parent_taxonomy_id: Number(taxon.ParentTaxId[0]),
				name: taxon.ScientificName[0],
				rank: taxon.Rank[0]
			},
			rankObjects = taxon.LineageEx[0].Taxon

		result.taxid = Number(taxon.TaxId[0])
		result.organism = taxon.ScientificName[0]

		rankObjects.forEach((rankObject, i) => {
			let node = {
				id: Number(rankObject.TaxId[0]),
				parent_taxonomy_id: i > 0 ? result.lineage[i - 1].id : kNCBIRootTaxonomyId,
				name: rankObject.ScientificName[0],
				rank: rankObject.Rank[0]
			}
			result.lineage.push(node)
			if (result[node.rank] === null)
				result[node.rank] = node.name
		})

		result.lineage.push(currentNode)
		if (result[currentNode.rank] === null)
			result[currentNode.rank] = currentNode.name

		if (result.species) {
			let strain = result.organism
				.split(/\s+/g)
				.slice(kNumberOfWordsInSpecies)
				.join(' ')
				.trim()

			// It is quite possible that strain will equal the empty string. The following test
			// avoids saving this to the database (strain will be null)
			if (strain)
				result.strain = strain
		}

		return result
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * @param {Number} taxonomyId - NCBI taxonomy id
	 * @param {Transaction} [transaction = null] - Sequelize transaction object
	 * @returns {Promise} with resolve as boolean true if the give node Taxonomy ID exists in the taxonomy table
	 */
	nodeExists_(taxonomyId, transaction = null) {
		return this.taxonomyModel_.find({
			where: {
				id: taxonomyId
			},
			transaction
		})
		.then((taxonomyRow) => {
			return !!taxonomyRow
		})
	}

	/**
	 * Inserts ${taxonomyRecord} if it does not already exist in the database. If it does exist,
	 * throws an IntermediateRankExistsError.
	 *
	 * @param {Object} taxonomyRecord
	 * @param {Number} taxonomyRecord.id - NCBI taxonomy id
	 * @param {Number} taxonomyRecord.parent_taxonomy_id - parent NCBI taxonomy id
	 * @param {String} taxonomyRecord.name
	 * @param {String} taxonomyRecord.rank
	 * @returns {Promise}
	 */
	insertNodeIfNew_(taxonomyRecord) {
		return this.taxonomyModel_.sequelize.transaction({
			isolationLevel: 'READ COMMITTED'
		}, (transaction) => {
			return this.nodeExists_(taxonomyRecord.id, transaction)
			.then((nodeExists) => {
				// No need iterate insertion check for parents. If the node already exists, its parents must exist as well.
				if (nodeExists)
					throw new IntermediateRankExistsError()

				return this.taxonomyModel_.create(taxonomyRecord, {transaction})
				.then((taxonomy) => {
					if (this.logger_)
						this.logger_.info(taxonomy.get(), `Inserted new taxonomy node: ${taxonomy.name}`)
				})
			})
		})
	}
}
