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
	LocationStringParser = require('../../lib/bio/LocationStringParser'),
	genbankStream = require('../../lib/streams/genbank-stream'),
	mutil = require('../../lib/mutil'),
	ncbiAssemblyReportStream = require('../../lib/streams/ncbi-assembly-report-stream'),
	uniqueStream = require('../../lib/streams/unique-stream'),
	seqUtil = require('../../lib/bio/seq-util'),
	serializeStream = require('../../lib/streams/serialize-stream'),
	genbankMistStream = require('../../lib/streams/genbank-mist-stream')

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

		this.componentsWriteStream_ = this.promiseWriteStreamObj(
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.components')
		)
		this.dseqsWriteStream_ = this.promiseWriteStreamObj(
			uniqueStream('id'),
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.dseqs')
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

		this.genesWriteStream_ = this.promiseWriteStreamObj(
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.genes')
		)

		this.xrefsWriteStream_ = this.promiseWriteStreamObj(
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.xrefs')
		)

		this.componentFeaturesStream_ = this.promiseWriteStreamObj(
			serializeStream.ndjson(),
			this.fileMapper_.pathFor('core.component-features')
		)

		this.writeStreams_ = [
			this.componentsWriteStream_,
			this.dseqsWriteStream_,
			this.aseqsWriteStream_,
			this.aseqsFaaWriteStream_,
			this.genesWriteStream_,
			this.xrefsWriteStream_,
			this.componentFeaturesStream_
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
			// Capture and bork on any stream errors
			for (let stream of this.writeStreams_)
				stream.on('error', reject)

			return this.indexAssemblyReport_()
			.then(this.parseGenbankFlatFile_.bind(this))
			.then(this.markTaskAsDone_.bind(this))
			.then(resolve)
			.catch(reject)
		})
	}

	teardown() {
		this.locationStringParser_ = null

		this.assemblyReportMap_.clear()
		this.assemblyReportMap_ = null

		return Promise.each(this.writeStreams_, (writeStream) => writeStream.endPromise())
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
			this.logger_.info(`Read ${this.assemblyReportMap_.size} row(s) from the assembly report`)
		})
	}

	parseGenbankFlatFile_() {
		let genbankFlatFile = this.fileMapper_.pathFor('genomic-genbank'),
			readStream = fs.createReadStream(genbankFlatFile),
			gunzipStream = zlib.createGunzip(),
			genbankReader = genbankStream(),
			genbankMistReader = genbankMistStream(this.models_),
			index = 0

		pump(readStream, gunzipStream, genbankReader, genbankMistReader)

		return streamEachPromise(genbankMistReader, (mistData, next) => {
			let component = mistData.component,
				compoundAccession = component.compoundAccession(),
				tmpLogger = this.logger_.child({
					'component.accession': compoundAccession,
					index
				})
			++index
			tmpLogger.info('Successfully parsed Genbank record')

			let assemblyReport = this.assemblyReportMap_.get(compoundAccession)
			if (!assemblyReport) {
				next(new Error('Genbank record does not have corresponding assembly report entry'))
				return null
			}

			// Assembly report details
			[component.genbank_accession, component.genbank_version] = mutil.parseAccessionVersion(assemblyReport.genbankAccession)
			component.name = assemblyReport.name
			component.role = assemblyReport.role
			component.assigned_molecule = assemblyReport.assignedMolecule
			component.type = assemblyReport.type
			component.genbank_refseq_relationship = assemblyReport.genbankRefseqRelationship

			return this.componentsWriteStream_.writePromise(component)
			.then(() => {
				tmpLogger.info('>> Streamed component data')
				return Promise.each(mistData.genes, (gene) => this.genesWriteStream_.writePromise(gene))
			})
			.then(() => {
				tmpLogger.info(`>> Streamed ${mistData.genes.length} gene(s)`)
				return Promise.each(mistData.dseqs, (dseq) => this.dseqsWriteStream_.writePromise(dseq))
			})
			.then(() => {
				tmpLogger.info(`>> Streamed ${mistData.dseqs.length} dseq(s)`)
				// Note: in the setup, we pipe the output of this stream to two separate streams:
				// 1) the aseqs FASTA
				// 2) and the aseqs ndjson
				return Promise.each(mistData.aseqs, (aseq) => this.uniqueAseqsStream_.writePromise(aseq))
			})
			.then(() => {
				tmpLogger.info(`>> Streamed ${mistData.aseqs.length} aseq(s)`)
				return Promise.each(mistData.xrefs, (xref) => this.xrefsWriteStream_.writePromise(xref))
			})
			.then(() => {
				tmpLogger.info(`>> Streamed ${mistData.xrefs.length} cross reference(s)`)
				return Promise.each(mistData.componentFeatures, (componentFeature) => this.componentFeaturesStream_.writePromise(componentFeature))
			})
			.then(() => {
				tmpLogger.info(`>> Streamed ${mistData.componentFeatures.length} non-gene feature(s)`)
				next()
			})
			.catch(next)
		})
	}

	markTaskAsDone_() {
		return this.promiseWriteStream(this.doneFile_).endPromise()
	}
}
