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

		let crossingOrigin = this.isCrossingOrigin_(genes)

		let tempGroup = {
			items: [],
			strand: ''
		}


		//console.log ( '=>' + JSON.stringify(genes))

		// Initialize from the back

		let lastGroupDone = false

		if (crossingOrigin) {
			//console.log('Crossed')
			let lastGene = genes.pop()
			tempGroup = {items: [lastGene], strand: lastGene.strand}
			//console.log(tempGroup)
			while (!lastGroupDone && genes.length > 1) {
				lastGene = genes.pop()
				//console.log(lastGene)
				if (this.geneBelongsToGroup_(lastGene, tempGroup, true)) {
					tempGroup.items.push(lastGene)
				}
				else {
					genes.push(lastGene)
					lastGroupDone = true
				}
			}
		}

		tempGroup.items.reverse()
		//console.log(tempGroup)

		genes.forEach((gene, i) => {
			if (tempGroup.items.length === 0) {
				tempGroup = {items: [gene], strand: gene.strand}
			}
			else if (this.geneBelongsToGroup_(gene, tempGroup, false)) {
				tempGroup.items.push(gene)
			}
			else {
				if (tempGroup.items.length >= kMinGroupSize)
					groups.push(tempGroup.items)

				tempGroup = {items: [gene], strand: gene.strand}
			}
/*			console.log('==>')
			console.log(tempGroup)
			console.log(gene)
			console.log(groups)*/
		})
		if (tempGroup.items.length >= kMinGroupSize)
			groups.push(tempGroup.items)
		return groups
	}

	// ----------------------------------------------------
	// Private methods
	geneBelongsToGroup_(gene, group, backwards = false) {
		let onSameStrand = group.strand === gene.strand,
			closerThanCutoff = true
		if (backwards)
			closerThanCutoff = group.items[group.items.length - 1].start - gene.stop < this.distanceCutoffBp_
		else
			closerThanCutoff = gene.start - group.items[group.items.length - 1].stop < this.distanceCutoffBp_
		return onSameStrand && closerThanCutoff
	}
	/**
	 * Returns true if there is a gene that crosses the origin
	 * Assumption: 	1) After sorting based on starting positions, the only gene that could cross origin is the last one.
	 * 				2) Gene crossing the origin has the stop position smaller than the start position.
	 * @param {Array.<Object>} genes
	 * @returns {Boolean}
	 */
	isCrossingOrigin_(genes) {
		return genes[genes.length - 1].start > genes[genes.length - 1].stop
	}

}

module.exports.kDefaultDistanceCutoffBp = kDefaultDistanceCutoffBp
