'use strict'

// Local
const mutil = require('../mutil')

/**
 * Extracts data from GenBank record objects and reshapes to the MiST data structure. Arbitrary ids
 * are automatically assigned in a monotonically increasing fashion for each corresponding database
 * table. These sequences continue for the of each adapter instance. Thus, multiple calls to adapt()
 * will continue with identifiers based off of the sequences last values.
 */
module.exports =
class GenbankMistAdapter {
	/**
	 * @constructor
	 * @param {Object} models MiST data models: GenomeReference, Component, Gene, Xref,
	 *   ComponentFeature, Aseq, and Dseq
	 */
	constructor(models) {
		this.models_ = models

		this.referencesIdSequence_ = mutil.sequence()
		this.componentsIdSequence_ = mutil.sequence()
		this.genesIdSequence_ = mutil.sequence()
		this.xrefsIdSequence_ = mutil.sequence()
		this.componentsFeaturesIdSequence = mutil.sequence()
	}

	/**
	 * @param {Object} genbankRecord an object representing an entire genbank record such as that
	 *   returned from the genbankStream
	 * @returns {Object} MiST database compatible object
	 */
	adapt(genbankRecord) {
		let result = {
			genomes_references: null,
			component: null,
			genes: null,
			xrefs: null,
			components_features: null,
			aseqs: null,
			dseqs: null
		}

		return result
	}
}
