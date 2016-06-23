/**
 * This task parses the NCBI data files (assembly report and genomic genbank flat file) into the set
 * of core json data files:
 *
 * genomes.ndjson
 * components.ndjson / components.fna
 * genes.ndjson
 * gseqs.ndjson
 * aseqs.faa: unique aseqs contained in this genome
 *
 * All json records are assigned identifiers beginning with 1. A final task before loading into the
 * database will be reserving the id ranges, storing these in id-blocks.js, and assigning before
 * insertion.
 *
 * Upon successfully completing this task, the empty file task.core-data.done is created.
 */
'use strict'

// Core
const fs = require('fs'),
	path = require('path'),
	zlib = require('zlib')

// Vendor
const Promise = require('bluebird')

// Local
const mutil = require('../../lib/mutil'),
	AbstractTask = require('./AbstractTask'),
	GenbankReaderStream = require('../../lib/streams/GenbankReaderStream'),
	NCBIAssemblyReportStream = require('../../lib/streams/NCBIAssemblyReportStream')

// Constants
const kDoneFileName = 'task.core-data.done'

module.exports =
class ParseCoreDataTask extends AbstractTask {
	setup() {
		this.doneFile_ = path.resolve(this.fileMapper_.genomeRootPath(), kDoneFileName)
		this.assemblyReportRows_ = []

		// Track which gseq and aseq ids have been processed
		this.gseqIdSet_ = new Set()
		this.aseqIdSet_ = new Set()

		this.gseqsWriterStream_ = fs.createWriteStream(this.fileMapper_.pathFor('core.gseqs'))
		this.aseqsFaaWriterStream_ = fs.createWriteStream(this.fileMapper_.pathFor('core.aseqs-faa'))

		return Promise.resolve()
	}

	/**
	 * @returns {Promise.<Boolean>}
	 */
	isAlreadyDone() {
		return mutil.fileExists(this.doneFile_)
	}

	run() {
		return this.readAssemblyReport_()
		.then(this.parseGenbankFlatFile_.bind(this))
		.then(this.markTaskAsDone_.bind(this))
	}

	teardown() {
		this.assemblyReportRows_ = null

		this.gseqIdSet_.clear()
		this.gseqIdSet_ = null
		this.aseqIdSet_.clear()
		this.aseqIdSet_ = null

		this.gseqsWriterStream_.end()
		this.gseqsWriterStream_ = null
		this.aseqsFaaWriterStream_.end()
		this.aseqsFaaWriterStream_ = null

		return Promise.resolve()
	}

	// ----------------------------------------------------
	// Private methods
	readAssemblyReport_() {
		return new Promise((resolve, reject) => {
			let assemblyReportFile = this.fileMapper_.pathFor('assembly-report'),
				readStream = fs.createReadStream(assemblyReportFile),
				ncbiAssemblyReportStream = new NCBIAssemblyReportStream()

			readStream
			.on('error', reject)
			.pipe(ncbiAssemblyReportStream)
			.on('error', reject)
			.on('data', (assemblyReportRow) => {
				this.assemblyReportRows_.push(assemblyReportRow)
			})
			.on('end', () => {
				this.logger_.info(`Read ${this.assemblyReportRows_.length} rows from the assembly report`)
				resolve()
			})
		})
	}

	parseGenbankFlatFile_() {
		return new Promise((resolve, reject) => {
			let genbankFlatFile = this.fileMapper_.pathFor('genomic-genbank'),
				readStream = fs.createReadStream(genbankFlatFile),
				gunzipStream = zlib.createGunzip(),
				genbankReaderStream = new GenbankReaderStream(),
				index = 1

			readStream
			.on('error', reject)
			.pipe(gunzipStream)
			.on('error', reject)
			.pipe(genbankReaderStream)
			.on('error', reject)
			.on('data', (genbankRecord) => {
				this.interruptCheck()
				genbankReaderStream.pause()

				++index
				this.logger_.info({locus: genbankRecord.locus, index}, 'Successfully parsed Genbank record')

				this.processGenbankRecord_(genbankRecord)
				.then(() => {
					genbankReaderStream.resume()
				})
				.catch((error) => {
					readStream.destroy()
					reject(error)
				})
			})
			.on('end', resolve)
		})
	}

	processGenbankRecord_(record) {
		// return Promise.delay(1000)
	}

	markTaskAsDone_() {
		let stream = fs.createWriteStream(this.doneFile_)
		stream.close()
	}
}
