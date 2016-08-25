'use strict'

// Core
const assert = require('assert')

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
	 * @param {Boolean} [isCircular = false]
	 * @returns {Array.<Array.<Object>>}
	 */
	findGroups(genes, isCircular = false) {
		if (!Array.isArray(genes))
			throw new Error('invalid genes argument: expected array of objects')

		if (genes.length === 0)
			return []

		let genesCopy = genes.slice(),
			groups = [],
			lastGroup = []

		genesCopy.sort(function(a, b) {
			return a.start - b.start
		})

		if (isCircular)
			lastGroup = this.lookBackwardsForGroup_(genesCopy)

		if (genesCopy.length)
			groups = this.lookForwardsForGroups_(genesCopy, lastGroup)
		else if (lastGroup.length >= kMinGroupSize)
			groups = [lastGroup]

		groups.sort(function(a, b) {
			return a[0].start - b[0].start
		})

		return groups
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Progressively pops genes off of ${genes} to build the terminal group.
	 *
	 * @param {Array.<Object>} genes
	 * @returns {Array.<Object>} - a group containing at least one gene (the very last one in the array)
	 */
	lookBackwardsForGroup_(genes) {
		assert(genes.length)

		let group = [
			genes.pop()
		]

		while (genes.length) {
			let lastGene = genes.pop()
			if (this.geneBelongsToGroup_(lastGene, group, true)) {
				group.push(lastGene)
				continue
			}

			genes.push(lastGene)
			break
		}

		group.reverse()

		return group
	}

	/**
	 * Put more documentation here! For example, why do we need the ${backwardsGroup} argument?
	 *
	 * @param {Array.<Object>} genes
	 * @param {Array.<Array.<Object>>} backwardsGroup
	 * @returns {Array.<Array.<Object>>} - array of groups
	 */
	lookForwardsForGroups_(genes, backwardsGroup) {
		let groups = [],
			lastGroup = backwardsGroup

		genes.forEach((gene, i) => {
			if (lastGroup.length === 0) {
				lastGroup = [gene]
			}
			else if (this.geneBelongsToGroup_(gene, lastGroup, false)) {
				lastGroup.push(gene)
			}
			else {
				if (lastGroup.length >= kMinGroupSize)
					groups.push(lastGroup)
				lastGroup = [gene]
			}
		})

		if (lastGroup.length >= kMinGroupSize)
			groups.push(lastGroup)

		return groups
	}

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
		let onSameStrand = group[0].strand === gene.strand,
			closerThanCutoff = true
		if (backwards)
			closerThanCutoff = group[group.length - 1].start - gene.stop < this.distanceCutoffBp_
		else
			closerThanCutoff = gene.start - group[group.length - 1].stop < this.distanceCutoffBp_
		return onSameStrand && closerThanCutoff
	}
}

module.exports.kDefaultDistanceCutoffBp = kDefaultDistanceCutoffBp
