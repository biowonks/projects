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
const AbstractTask = require('./AbstractTask'),
	FastaSeq = require('../../lib/bio/FastaSeq'),
	LocationStringParser = require('../../lib/bio/LocationStringParser'),
	Seq = require('../../lib/bio/Seq'),
	genbankStream = require('../../lib/streams/genbank-stream'),
	mutil = require('../../lib/mutil'),
	ncbiAssemblyReportStream = require('../../lib/streams/ncbi-assembly-report-stream'),
	uniqueStream = require('../../lib/streams/unique-stream'),
	seqUtil = require('../../lib/bio/seq-util'),
	serializeStream = require('../../lib/streams/serialize-stream')

// Constants
const kDoneFileName = 'task.core-data.done'

let streamEachPromise = Promise.promisify(streamEach)

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

		this.componentsIdSequence_ = mutil.sequence()
		this.genesIdSequence_ = mutil.sequence()

		this.componentsFnaWriteStream_ = this.promiseWriteStream(this.fileMapper_.pathFor('core.components-fna'))
		this.componentsWriteStream_ = this.promiseWriteStreamObj(
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.components')
		)
		this.gseqsWriteStream_ = this.promiseWriteStreamObj(
			uniqueStream('id'),
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.gseqs')
		)

		// After finding unique aseqs, the results are piped to two different sinks:
		// the aseqs.faa and aseqs.ndjson.gz
		this.uniqueAseqsStream_ = this.promiseWriteStreamObj(uniqueStream('id'))
		this.aseqsFaaWriteStream_ = this.promiseWriteStreamObj(
			this.uniqueAseqsStream_,
			serializeStream((aseq) => {
				return seqUtil.fasta(aseq.id, aseq.sequence)
			}),
			this.fileMapper_.pathFor('core.aseqs-faa')
		)

		this.aseqsWriteStream_ = this.promiseWriteStreamObj(
			this.uniqueAseqsStream_,
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.aseqs')
		)

		this.writeStreams_ = [
			this.componentsFnaWriteStream_,
			this.componentsWriteStream_,
			this.gseqsWriteStream_,
			this.aseqsWriteStream_,
			this.aseqsFaaWriteStream_
		]

		return Promise.resolve()
	}

	/**
	 * @returns {Promise.<Boolean>}
	 */
	isAlreadyDone() {
		return mutil.fileExists(this.doneFile_)
	}

	run() {
		return new Promise((resolve, reject) => {
			for (let stream of this.writeStreams_)
				stream.on('error', reject)

			return this.indexAssemblyReport_()
			.then(this.parseGenbankFlatFile_.bind(this))
			.then(resolve)
			.catch(reject)
			// .then(this.markTaskAsDone_.bind(this))
		})
	}

	teardown() {
		this.assemblyReportMap_.clear()
		this.assemblyReportMap_ = null

		this.gseqIdSet_.clear()
		this.gseqIdSet_ = null

		this.aseqIdSet_.clear()
		this.aseqIdSet_ = null

		return Promise.each(this.writeStreams_, (writeStream) => {
			return writeStream ? writeStream.endPromise() : null
		})
	}

	// ----------------------------------------------------
	// Private methods
	indexAssemblyReport_() {
		let assemblyReportFile = this.fileMapper_.pathFor('assembly-report'),
			readStream = fs.createReadStream(assemblyReportFile),
			ncbiAssemblyReportReader = ncbiAssemblyReportStream()

		pump(readStream, ncbiAssemblyReportReader)

		return streamEachPromise(ncbiAssemblyReportReader, (assembly, next) => {
			this.assemblyReportMap_.set(assembly.refseqAccession, assembly)
			next()
		})
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

		pump(readStream, gunzipStream, genbankReader)

		return streamEachPromise(genbankReader, (record, next) => {
			++index
			this.logger_.info({locus: record.locus, index}, 'Successfully parsed Genbank record')

			this.processGenbankRecord_(record)
			.then(next)
			.catch(next)
		})
	}

	processGenbankRecord_(record) {
		let genome = this.buildGenome_(),
			component = this.componentFromGenbank_(record, genome.id)

		return this.componentsFnaWriteStream_.writePromise(component.$fastaSeq.toString())
		.then(this.processFeatures_.bind(this, record.features, genome, component))
		.then(() => {
			Reflect.deleteProperty(component, '$fastaSeq')
			return this.componentsWriteStream_.writePromise(component)
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

		return Promise.each(features, (feature) => {
			if (feature.key === 'gene') {
				let location = this.locationStringParser_.parse(feature.location),
					seq = location.transcriptFrom(component.$fastaSeq),
					gseq = this.models_.Gseq.fromSeq(seq)

				return this.gseqsWriteStream_.writePromise(gseq)
			}
			else if (feature.key === 'CDS' && feature.translation && feature.translation[0]) {
				let seq = new Seq(feature.translation[0]),
					aseq = this.models_.Aseq.fromSeq(seq)

				// Note: in the setup, we pipe the output of this stream to two separate streams:
				// 1) the aseqs FASTA
				// 2) and the aseqs ndjson
				return this.uniqueAseqsStream_.writePromise(aseq)
			}

			return null
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
