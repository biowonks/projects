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
 * Part of this process involves assigning ids to each row after first allocating a block
 * of ids from the database.
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
	constructor(fileNameMapper, logger) {
		this.fileNameMapper_ = fileNameMapper
		this.logger_ = logger.child({phase: 'download'})
	}

	main() {
		return Promise.resolve()
	}
}
