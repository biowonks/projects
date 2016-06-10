'use strict'

// Local
let mutil = require('../mutil')

module.exports =
class NCBITaxonomyXMLParser {
	/**
	 * Parses NCBI Taxonomy XML for a specific organism into the following structure:
	 *
	 * {
	 *   taxonomyId
	 *   organism
	 *   lineage: ['cellular organisms', 'bacteria', ...]
	 *   lineageTaxonomyIds: [131567, 2, 203691, 203692, 136 ...]
	 *   superkingdom
	 *   kingdom
	 *   phylum
	 *   class
	 *   order
	 *   family
	 *   genus
	 *   species
	 *   strain
	 *	}
	 *
	 * The source XML expected by this parse function is that returned by the NCBI E-Utils service.
	 *
	 * Throws an error if the XML is invalid or something otherwise did not work as expected.
	 *
	 * @param {string} xml
	 * @returns {Promise} resolves to the parsed taxonomy result
	 */
	parse(xml) {
		return mutil.xmlToJs(xml)
		.then(this.parseRawTaxonomy_.bind(this))
	}

	/**
	 * @param {object} rawTaxonomy
	 * @returns {Object}
	 */
	parseRawTaxonomy_(rawTaxonomy) {
		let result = {
				taxonomyId: null,
				organism: null,
				lineage: [],
				lineageTaxonomyIds: [],
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
			taxon = rawTaxonomy.TaxaSet.Taxon[0],
			rankObjects = taxon.LineageEx[0].Taxon

		result.taxonomyId = Number(taxon.TaxId[0])
		result.organism = taxon.ScientificName[0]

		rankObjects.forEach((rankObject) => {
			let rankName = rankObject.ScientificName[0],
				rank = rankObject.Rank[0]
			result.lineage.push(rankName)
			result.lineageTaxonomyIds.push(Number(rankObject.TaxId[0]))
			if (result[rank] === null)
				result[rank] = rankName
		})

		if (result.species !== null)
			result.strain = this.strainFromOrganism_(result.organism)

		return result
	}

	/**
	 * An organism name contains the strain if it consists of 3 or more space separated words.
	 *
	 * @param {string} organism
	 * @returns {string}
	 */
	strainFromOrganism_(organism) {
		let matches = /^\S+\s+\S+\s+(.+)/.exec(organism)
		return matches ? matches[1].trim() : null
	}
}

