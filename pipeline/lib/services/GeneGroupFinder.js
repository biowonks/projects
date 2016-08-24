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
	 * @param {Boolean} circular
	 * @returns {Array.<Array.<Object>>}
	 */
	findGroups(genes, circular = false) {
		if (!Array.isArray(genes))
			throw new Error('invalid genes argument: expected array of objects')

		if (genes.length === 0)
			return []

		let groups = []
		genes.sort(function(a, b) {
			return a.start - b.start
		})

		let tempGroup = {
			items: [],
			strand: ''
		}

		// Initialize from the back
		let lastGroupDone = false

		if (circular) {
			let lastGene = genes.pop()
			tempGroup = {items: [lastGene], strand: lastGene.strand}
			while (!lastGroupDone && genes.length > 0) {
				lastGene = genes.pop()
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
		if (genes.length > 0) {
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
			})
			if (tempGroup.items.length >= kMinGroupSize)
				groups.push(tempGroup.items)
		}
		else if (tempGroup.items.length >= kMinGroupSize) {
			groups.push(tempGroup.items)
		}
		groups.sort(function(a, b) {
			return a[0].start - b[0].start
		})
		return groups
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Returns true if gene belongs to group. It checks two aspects:
	 *  1) Gene's start position is under the distance cutoff of the stop position of the last gene in the group
	 * 	2) Gene is in the same strand as the group.
	 *
	 * A optional parameter is backwards (default = false) used to answer if it gene belongs to group build backwards.
	 * Here the checks are:
	 * 	1) Gene's stop position is under the distance cutoff of the start position of the last gene in the group.
	 * 	2) Gene is in the same strand as the group
	 *
	 * @param {Array.<Object>} gene
	 * @param {Array.<Array.<Object>>} group
	 * @param {Boolean} backwards
	 * @returns {Boolean}
	 */
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

}

module.exports.kDefaultDistanceCutoffBp = kDefaultDistanceCutoffBp
