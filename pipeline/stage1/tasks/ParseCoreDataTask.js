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
const Promise = require('bluebird'),
	pump = require('pump'),
	streamEach = require('stream-each')

// Local
const mutil = require('../../lib/mutil'),
	AbstractTask = require('./AbstractTask'),
	genbankStream = require('../../lib/streams/genbank-stream'),
	ncbiAssemblyReportStream = require('../../lib/streams/ncbi-assembly-report-stream'),
	FastaSeq = require('../../lib/bio/FastaSeq'),

	PromiseWriteStream = require('../../lib/streams/PromiseWriteStream'),
	LocationStringParser = require('../../lib/bio/LocationStringParser')

// Constants
const kDoneFileName = 'task.core-data.done'

function *pseudoIdSequence() {
	let index = 1
	while (true) // eslint-disable-line no-constant-condition
		yield index++
}

let pumpPromise = Promise.promisify(pump)

module.exports =
class ParseCoreDataTask extends AbstractTask {
	constructor(...args) {
		super(...args)
		this.doneFile_ = path.resolve(this.fileMapper_.genomeRootPath(), kDoneFileName)
	}

	setup() {
		this.locationStringParser_ = new LocationStringParser()

		// {RefSeq accession: {}}
		this.assemblyReportMap_ = new Map()

		// Track which gseq and aseq ids have been processed
		this.gseqIdSet_ = new Set()
		this.aseqIdSet_ = new Set()

		this.componentsIdSequence_ = pseudoIdSequence()
		this.genesIdSequence_ = pseudoIdSequence()

		this.componentsFnaWriteStream_ = new PromiseWriteStream(this.fileMapper_.pathFor('core.components-fna'))
		this.componentsWriteStream_ = new PromiseWriteStream(this.fileMapper_.pathFor('core.components'))

		// this.gseqsWriteStream_ = fs.createWriteStream(this.fileMapper_.pathFor('core.gseqs'))
		// this.aseqsFaaWriteStream_ = fs.createWriteStream(this.fileMapper_.pathFor('core.aseqs-faa'))

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
		// .then(this.markTaskAsDone_.bind(this))
	}

	teardown() {
		this.assemblyReportMap_.clear()
		this.assemblyReportMap_ = null

		this.gseqIdSet_.clear()
		this.gseqIdSet_ = null

		this.aseqIdSet_.clear()
		this.aseqIdSet_ = null

		return Promise.all([
			this.componentsFnaWriteStream_.endPromise(),
			this.componentsWriteStream_.endPromise()
		])
	}

	// ----------------------------------------------------
	// Private methods
	indexAssemblyReport_() {
		let assemblyReportFile = this.fileMapper_.pathFor('assembly-report'),
			readStream = fs.createReadStream(assemblyReportFile),
			ncbiAssemblyReportReader = ncbiAssemblyReportStream()

		streamEach(ncbiAssemblyReportReader, (assembly, next) => {
			this.assemblyReportMap_.set(assembly.refseqAccession, assembly)
			next()
		})

		return pumpPromise(readStream, ncbiAssemblyReportReader)
		.then(() => {
			this.logger_.info(`Read ${this.assemblyReportMap_.size} rows from the assembly report`)
		})
	}

	parseGenbankFlatFile_() {
		let genbankFlatFile = this.fileMapper_.pathFor('genomic-genbank'),
			readStream = fs.createReadStream(genbankFlatFile),
			gunzipStream = zlib.createGunzip(),
			genbankReader = genbankStream(),
			index = 0

		streamEach(genbankReader, (record, next) => {
			++index
			this.logger_.info({locus: record.locus, index}, 'Successfully parsed Genbank record')

			console.log('Num features', record.features.length)

			next()

			// this.processGenbankRecord_(record)
			// .then(next)
		})

		return pumpPromise(readStream, gunzipStream, genbankReader)
	}

	processGenbankRecord_(record) {
		let genome = this.buildGenome_(),
			component = this.componentFromGenbank_(record, genome.id),
			charsPerLine = 80

		return this.componentsFnaWriteStream_.writePromise(component.$fastaSeq.toString(charsPerLine))
		.then(this.processFeatures_(record.features, genome, component))
		.then(() => {
			Reflect.deleteProperty(component, '$fastaSeq')
			return this.componentsWriteStream_.writePromise(JSON.stringify(component) + '\n')
		})
	}

	buildGenome_() {
		let genome = this.queuedGenome_.toJSON()
		genome.id = 1
		Reflect.deleteProperty(genome, 'worker_id')
		Reflect.deleteProperty(genome, 'created_at')
		Reflect.deleteProperty(genome, 'updated_at')
		return genome
	}

	componentFromGenbank_(record, genomeId) {
		let version = record.version,
			assemblyReport = this.assemblyReportMap_.get(version),
			componentId = this.componentsIdSequence_.next().value,
			fastaSeq = new FastaSeq(String(componentId), record.origin)

		fastaSeq.normalize()

		if (!assemblyReport)
			throw new Error('Genbank record does not have corresponding assembly report entry')

		return {
			id: componentId,
			genome_id: genomeId,

			// Assembly report details
			refseq_accession: record.accession.primary,
			genbank_accession: assemblyReport.genbankAccession,
			name: assemblyReport.name,
			role: assemblyReport.role,
			assigned_molecule: assemblyReport.assignedMolecule,
			type: assemblyReport.type,
			genbank_refseq_relationship: assemblyReport.genbankRefseqRelationship,

			// Genbank fields
			is_circular: this.isCircular_(record),
			dna: null,
			length: fastaSeq.length(),

			$fastaSeq: fastaSeq
		}
	}

	isCircular_(record) {
		return (record.locus.topology === 'circular' || record.locus.topology === 'linear') ?
			record.locus.topology === 'circular' : null
	}

	processFeatures_(features, genome, component) {
		this.logger_.info(`Processing ${features.length} features`)

		// let i = 1

		features.filter((feature) => feature.key === 'gene')
		.forEach((gene) => {
			// let location = this.locationStringParser_.parse(gene.location)
				// seq = location.transcriptFrom(component.$fastaSeq)

			// console.log(`${i}\t${seq.length()}\t${seq.sequence().substr(0, 50)}`)
		})
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
