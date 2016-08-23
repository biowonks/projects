'use strict'

// Constants
const kDefaultDistanceCutoffBp = 200,
	kMinGroupSize = 2

module.exports =
class GeneGroupFinder {
	/**
	 * Groups genes that are cluster together in the chromosome under a certain distance cutoff (in bp) and has the same strand.
	 *
	 * The default distance cutoff (200 bp) is based in the findings of the following publication:
	 * Moreno-Hagelsieb, G. & Collado-Vides, J. A powerful non-homology method for the prediction of operons in prokaryotes. Bioinformatics 18, S329–S336 (2002).
	 *
	 * @constructor
	 * @param {Number} [distanceCutoffBp = 200] - maximum inter-gene distance for two genes to be consolidated into a group
	 */
	constructor(distanceCutoffBp = kDefaultDistanceCutoffBp) {
		this.distanceCutoffBp_ = distanceCutoffBp
	}

	/**
	 * @returns {Number}
	 */
	distanceCutoffBp() {
		return this.distanceCutoffBp_
	}

	/**
	 * @param {Array.<Object>} genes
	 * @param {Number} gene.start - 1-based
	 * @param {Number} gene.stop - 1-based
	 * @param {String} gene.strand - '-' or '+''
	 * @returns {Array.<Array.<Object>>}
	 */
	findGroups(genes) {
		if (!Array.isArray(genes))
			throw new Error('invalid genes argument: expected array of objects')

		let groups = []
		genes.sort(function(a, b) {
			return a.start - b.start
		})

		let tempGroup = {
			items: [],
			strand: ''
		}

		console.log ( '=>' + JSON.stringify(genes))
		genes.forEach((gene, i) => {
			if (tempGroup.items.length === 0) {
				tempGroup = {items: [gene], strand: gene.strand}
			}
			else if (this.geneBelongsToGroup_(gene, tempGroup)) {
				tempGroup.items.push(gene)
			}
			else {
				if (tempGroup.items.length >= kMinGroupSize)
					groups.push(tempGroup.items)

				tempGroup = {items: [gene], strand: gene.strand}
			}
			console.log('==>')
			console.log(tempGroup)
			console.log(gene)
			console.log(groups)
		})
		if (tempGroup.items.length >= kMinGroupSize)
			groups.push(tempGroup.items)
		return groups
	}

	// ----------------------------------------------------
	// Private methods
	geneBelongsToGroup_(gene, group) {
		let onSameStrand = group.strand === gene.strand,
			closerThanCutoff = gene.start - group.items[group.items.length - 1].stop < this.distanceCutoffBp_

		return onSameStrand && closerThanCutoff
	}
}

module.exports.kDefaultDistanceCutoffBp = kDefaultDistanceCutoffBp
