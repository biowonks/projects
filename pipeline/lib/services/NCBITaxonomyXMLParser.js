'use strict'

let mutil = require('../mutil')

module.exports =
class NCBITaxonomyXMLParser {
	/**
	 * Parses NCBI Taxonomy XML for a specific organism into the following structure:
	 *
	 * {
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
	 *
	 * The source XML expected by this parse function is that returned by the NCBI E-Utils service.
	 *
	 * Throws an error if the XML is invalid or something otherwise did not work as expected.
	 *d
	 * @param {string} xml
	 * @return {Object}
	 */

	parse_(jsonTaxonomy) {
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
			taxon = jsonTaxonomy.TaxaSet.Taxon[0],
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
			if (taxonomyObject[rank] === null)
				taxonomyObject[rank] = rankName
		})

		let numberOfWordsInSpecies = 2
		if (taxonomyObject.species !== null) {
			taxonomyObject.strain = taxonomyObject.organism.split(/\s+/g).slice(numberOfWordsInSpecies)
			.join(' ')
			.trim()
		}

		return taxonomyObject
	}

	getTaxonomy(xmlFile) {
		return mutil.xmlFile2json(xmlFile)
			.then((jsonTaxonomy) => {
				return this.parse_(jsonTaxonomy)
			})
	}
}

