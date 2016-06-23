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
 *
 * Genbank Record is really RefSeq data just formatted using the GenBank specification. Thus, its
 * identifiers (e.g. LOCUS) are RefSeq specific.
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
	NCBIAssemblyReportStream = require('../../lib/streams/NCBIAssemblyReportStream'),
	Seq = require('../../lib/bio/Seq')

// Constants
const kDoneFileName = 'task.core-data.done'

function *pseudoIdSequence() {
	let index = 1
	while (true) // eslint-disable-line no-constant-condition
		yield index++
}

module.exports =
class ParseCoreDataTask extends AbstractTask {
	setup() {
		this.doneFile_ = path.resolve(this.fileMapper_.genomeRootPath(), kDoneFileName)
		// {RefSeq accession: {}}
		this.assemblyReportMap_ = new Map()

		// Track which gseq and aseq ids have been processed
		this.gseqIdSet_ = new Set()
		this.aseqIdSet_ = new Set()

		this.componentsIdSequence_ = pseudoIdSequence()
		this.genesIdSequence_ = pseudoIdSequence()

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
		return this.indexAssemblyReport_()
		.then(this.parseGenbankFlatFile_.bind(this))
		.then(this.markTaskAsDone_.bind(this))
	}

	teardown() {
		this.assemblyReportMap_.clear()
		this.assemblyReportMap_ = null

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
	indexAssemblyReport_() {
		return new Promise((resolve, reject) => {
			let assemblyReportFile = this.fileMapper_.pathFor('assembly-report'),
				readStream = fs.createReadStream(assemblyReportFile),
				ncbiAssemblyReportStream = new NCBIAssemblyReportStream()

			readStream
			.on('error', reject)
			.pipe(ncbiAssemblyReportStream)
			.on('error', reject)
			.on('data', (row) => {
				this.assemblyReportMap_.set(row.refseqAccession, row)
			})
			.on('end', () => {
				this.logger_.info(`Read ${this.assemblyReportMap_.size} rows from the assembly report`)
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

			function destroyAndReject(error) {
				readStream.destroy()
				reject(error)
			}

			readStream
			.on('error', destroyAndReject)
			.pipe(gunzipStream)
			.on('error', destroyAndReject)
			.pipe(genbankReaderStream)
			.on('error', destroyAndReject)
			.on('data', (genbankRecord) => {
				this.interruptCheck()
				genbankReaderStream.pause()

				++index
				this.logger_.info({locus: genbankRecord.locus, index}, 'Successfully parsed Genbank record')

				this.processGenbankRecord_(genbankRecord)
				.then(() => {
					genbankReaderStream.resume()
				})
				.catch(destroyAndReject)
			})
			.on('error', destroyAndReject)
			.on('end', resolve)
		})
	}

	processGenbankRecord_(record) {
		// let genome = this.queuedGenome_,
		// 	component = this.componentFromGenbank_(record, 1)
	}

	componentFromGenbank_(record, genomeId) {
		let refseqAccession = record.accession.primary,
			assemblyReport = this.assemblyReportMap_.get(refseqAccession),
			seq = new Seq(record.origin)

		seq.normalize()

		return {
			id: this.componentsIdSequence_.next().value,
			genome_id: genomeId,

			// Assembly report details
			refseq_accession: refseqAccession,
			genbank_accession: assemblyReport.genbankAccession,
			name: assemblyReport.name,
			role: assemblyReport.role,
			assigned_molecule: assemblyReport.assignedMolecule,
			type: assemblyReport.type,
			genbank_refseq_relationship: assemblyReport.genbankRefseqRelationship,

			// Genbank fields
			is_circular: this.isCircular_(record),
			dna: seq.sequence(),
			length: seq.length()
		}
	}

	isCircular_(record) {
		return (record.locus.topology === 'circular' || record.locus.topology === 'linear') ?
			record.locus.topology === 'circular' : null
	}

	markTaskAsDone_() {
		return new Promise((resolve, reject) => {
			let stream = fs.createWriteStream(this.doneFile_)
			stream
			.on('error', reject)
			.on('finish', resolve)
			stream.close()
		})
	}
}
