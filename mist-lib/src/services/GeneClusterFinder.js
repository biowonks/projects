'use strict';

// Core
const assert = require('assert');

// Constants
const kDefaultDistanceCutoffBp = 200,
  kMinGroupSize = 2;

module.exports =
class GeneClusterFinder {
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
    this.distanceCutoffBp_ = distanceCutoffBp;
  }

  /**
	 * @returns {Number}
	 */
  distanceCutoffBp() {
    return this.distanceCutoffBp_;
  }

  /**
	 * @param {Array.<Object>} genes
	 * @param {Number} gene.start - 1-based
	 * @param {Number} gene.stop - 1-based
	 * @param {String} gene.strand - '-' or '+''
	 * @param {Array.<Object>} options
	 * @param {Boolean} [options.isCircular = false]
	 * @param {Number} [options.repliconLength = 0]
	 * @returns {Array.<Array.<Object>>}
	 */
  findClusters(genes, options = {isCircular: false, repliconLength: 1}) {
    let isCircular = options.isCircular,
      repliconLength = options.repliconLength;

    if (!Array.isArray(genes))
      throw new Error('invalid genes argument: expected array of objects');

    if (genes.length === 0)
      return [];

    let genesCopy = genes.slice(),
      groups = [],
      lastGroup = [];

    genesCopy.sort(function(a, b) {
      return a.start - b.start;
    });

    if (isCircular && !options.repliconLength)
      throw new Error('If chromosome is circular replicon length must be passed the in options');

    if (isCircular)
      lastGroup = this.lookBackwardsForGroup_(genesCopy);

    if (genesCopy.length)
      groups = this.lookForwardsForGroups_(genesCopy, lastGroup, repliconLength);
    else if (lastGroup.length >= kMinGroupSize)
      groups = [lastGroup];

    groups.sort(function(a, b) {
      return a[0].start - b[0].start;
    });

    return groups;
  }

  // ----------------------------------------------------
  // Private methods
  /**
	 * Progressively pops genes off of ${genes} to build the terminal group.
	 *
	 * @param {Array.<Object>} genes
	 * @returns {Array.<Object>} - a pseudo group containing at least one gene (the very last one in the array)
	 */
  lookBackwardsForGroup_(genes) {
    assert(genes.length);

    let group = [
      genes.pop(),
    ];

    let backwardsCounting = true;

    while (genes.length) {
      let lastGene = genes.pop();
      if (this.geneBelongsToGroup_(lastGene, group, backwardsCounting)) {
        group.push(lastGene);
        continue;
      }

      genes.push(lastGene);
      break;
    }

    group.reverse();

    return group;
  }

  /**
	 * This will search for groups going forward in the chromosome. However, in circular chromosomes it gets tricky as the calculation of the distance between the genes depend on the size of the replicon, thus the ${repliconLength}, if the current group contains the terminal group in the chromosome, thus ${isLastGene}.
	 * 1) ${isLastGene} in the group? If true
	 *
	 * @param {Array.<Object>} genes
	 * @param {Array.<Array.<Object>>} currentGroup
	 * @returns {Array.<Array.<Object>>} - array of groups
	 * @param {Number} repliconLength - Total length of the replicon
	 */
  lookForwardsForGroups_(genes, currentGroup, repliconLength = 0) {
    let groups = [],
      lastGroup = currentGroup,
      backwardsCounting = false,
      isLastGene = true;

    genes.forEach((gene, i) => {
      if (lastGroup.length === 0) {
        lastGroup = [gene];
      }
      else if (this.geneBelongsToGroup_(gene, lastGroup, backwardsCounting, isLastGene, repliconLength)) {
        lastGroup.push(gene);
      }
      else {
        if (lastGroup.length >= kMinGroupSize)
          groups.push(lastGroup);
        lastGroup = [gene];
      }
      isLastGene = false;
    });

    if (lastGroup.length >= kMinGroupSize)
      groups.push(lastGroup);
    return groups;
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
	 * @param {Boolean} isLastGene - Is the last gene in the chromosome in the current group?
	 * @param {Number} repliconLength - Total length of the replicon
	 * @returns {Boolean}
	 */
  geneBelongsToGroup_(gene, group, backwards = false, isLastGene = false, repliconLength = 0) {
    let onSameStrand = group[0].strand === gene.strand,
      closerThanCutoff = true,
      isCrossing = this.isCrossing_(group);

    if (backwards)
      closerThanCutoff = group[group.length - 1].start - gene.stop <= this.distanceCutoffBp_;
    else if (isLastGene && !isCrossing)
      closerThanCutoff = gene.start + repliconLength - group[group.length - 1].stop <= this.distanceCutoffBp_;
    else
      closerThanCutoff = gene.start - group[group.length - 1].stop <= this.distanceCutoffBp_;
    return onSameStrand && closerThanCutoff;
  }
  /**
	 * Test if still needs to run test grouping backwards one more time. It depends if the last gene of the last group cross the origin (false) or not (true)
	 *
	 * @param {Array.<Array.<Object>>} group
	 * @returns {Boolean}
	 */
  isCrossing_(group) {
    return group[group.length - 1].start > group[group.length - 1].stop;
  }
};

module.exports.kDefaultDistanceCutoffBp = kDefaultDistanceCutoffBp;
