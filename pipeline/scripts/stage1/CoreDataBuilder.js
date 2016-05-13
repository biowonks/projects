/**
 * CoreDataBuilder takes raw NCBI data files obtained with the NCBIDataHelper and produces
 * a set of core genomic data files for downstream processing. These correspond to the
 * database tables:
 *
 *   aseqs
 *   gseqs
 *   genomes
 *   components
 *   genes
 *
 * Part of this process involves assigning ids with those allocated from the database. The
 * IdAllocator service reserves a block of ids for a given sequence, which this class then
 * uses to assign to its genomes, components, and genes. These blocks are stored/cached on
 * the filesystem in the event of a failure to avoid having to minimize non-sequential gaps
 * in the internal identifiers (although this really doesn't matter).
 */

'use strict'

// Core node libraries
let fs = require('fs')

// 3rd-party libraries
let Promise = require('bluebird'),
	byline = require('byline')

// Local includes
let mutil = require('../lib/mutil')

module.exports =
class CoreDataBuilder {
	constructor(services, models, fileNameMapper, logger) {
		this.services_ = services
		this.models_ = models
		this.fileNameMapper_ = fileNameMapper
		this.logger_ = logger.child({phase: 'core-data'})
	}

	main() {
		return this.services_.idAllocator.reserve(this.models_.Genome.sequenceName(), 1)
		.then((result) => {
			console.log(result)
		})
	}

	// ----------------------------------------------------

}
