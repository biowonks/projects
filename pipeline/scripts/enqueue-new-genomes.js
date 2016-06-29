#!/usr/bin/env node

/**
 * Performs the following steps (and ultimately kickstarts the pipeline):
 *
 * - Download the assembly summaries from NCBI
 * - Load summaries into memory
 * - insert genomes with unique refseq assembly accessions into the database queue
 *
 * This script may be executed at any time and independent of the other scripts to
 * keep inline with the core concept of minimal coupling and dependencies.
 *
 * If a refseq assembly accession already is queued, that record remains even if
 * the latest assembly summary contains updated information. This is for simplicity
 * purposes and avoids premature work.
 */

'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const program = require('commander'),
	parse = require('csv-parse'),
	pumpify = require('pumpify'),
	split = require('split'),
	streamEach = require('stream-each'),
	through2 = require('through2'),
	Promise = require('bluebird')

// Local
const mutil = require('../lib/mutil'),
	BootService = require('../../services/BootService')

const streamEachPromise = Promise.promisify(streamEach)

program
.description('Enqueues new microbial genomes located at NCBI for integration into the MiST database')
.parse(process.argv)

// --------------------------------------------------------
// Main logic encapsulated in class
class Enqueuer {
	constructor() {
		let config = BootService.config
		this.pipelineConfig_ = config.pipeline
		this.bootService_ = new BootService({
			logger: {
				name: 'enqueuer',
				streams: [
					{
						level: 'info',
						stream: process.stdout
					},
					{
						level: 'error',
						path: this.pipelineConfig_.enqueuer.logging.errFile
					}
				]
			}
		})
		this.tempDir_ = path.resolve(this.pipelineConfig_.paths.tmp, 'enqueuer')
		this.logger_ = this.bootService_.logger()
		this.sequelize_ = null
		this.models_ = null
		this.numGenomesQueued_ = 0
	}

	main() {
		this.logger_.info('Start')

		this.bootService_.setup()
		.then(() => {
			this.sequelize_ = this.bootService_.sequelize()
			this.models_ = this.bootService_.models()

			return this.createTemporaryDirectory_()
		})
		.then(this.enqueueNewAssemblies_.bind(this))
		.catch((error) => {
			if (error instanceof BootService.Sequelize.DatabaseError)
				this.logger_.error({name: error.name, sql: error.sql}, error.message)
			else
				this.logger_.error({error, stack: error.stack}, 'Unexpected error')
		})
	}

	// ----------------------------------------------------
	// Private methods
	createTemporaryDirectory_() {
		return mutil.mkdir(this.tempDir_)
		.then((result) => {
			if (result.created)
				this.logger_.info({directory: result.directory}, 'Created temporary directory')
		})
	}

	enqueueNewAssemblies_() {
		return Promise.each(this.pipelineConfig_.ncbi.ftp.assemblySummaryLinks, (assemblyLink) => {
			if (this.maximumGenomesQueued_())
				return null

			return this.downloadAssemblySummary_(assemblyLink)
			.then(this.processSummaryFile.bind(this))
		})
	}

	maximumGenomesQueued_() {
		return this.pipelineConfig_.enqueuer.maxNewGenomesToQueuePerRun &&
			this.numGenomesQueued_ >= this.pipelineConfig_.enqueuer.maxNewGenomesToQueuePerRun
	}

	downloadAssemblySummary_(link) {
		let destFile = path.resolve(this.tempDir_, link.filename)
		return mutil.pathIsYoungerThan(destFile, this.pipelineConfig_.summaryDuration)
			.then((isYounger) => {
				if (isYounger) {
					this.logger_.info({path: destFile}, `Summary file already exists and is younger than ${this.pipelineConfig_.summaryDuration.humanize()}`)
					return destFile
				}

				this.logger_.info({path: destFile}, `Downloading assembly summary: ${link.filename}`)
				return mutil.download(link.url, destFile)
					.then((downloadResult) => {
						this.logger_.info('Download finished')
						return destFile
					})
			})
	}

	processSummaryFile(file) {
		this.logger_.info({file}, 'Processing summary file')
		let parser = parse({
			columns: true,
			delimiter: '\t',
			trim: true,
			relax: true,
			skip_empty_lines: true,
			auto_parse: true
		})

		let readStream = fs.createReadStream(file),
			// The assembly summary files have two header lines the first of which is merely
			// descriptive; however, it causes csv-parse to choke because it is looking for the
			// header line. Thus, this through stream skips the first line as well as re-appends the
			// newline character that is stripped by LineStream.
			skippedFirstLine = false,
			skipLineStream = through2.obj(function(line, encoding, done) {
				if (skippedFirstLine)
					// The CSV parser expects input with newlines. Here we add them back because the
					// LineStream removes them.
					this.push(line + '\n') // eslint-disable-line no-invalid-this
				else
					skippedFirstLine = true
				done()
			}),
			stream = pumpify.obj(readStream, split(), skipLineStream, parser)

		return streamEachPromise(stream, (row, next) => {
			let genomeData = this.genomeDataFromRow_(row)
			if (genomeData.refseq_category !== 'representative genome' &&
				genomeData.refseq_category !== 'reference genome') {
				next()
				return
			}

			this.insertGenome_(genomeData)
			.then((genome) => {
				if (genome) {
					this.logger_.info({'genome.name': genome.name, accession: genome.accession}, 'Enqueued new genome')

					this.numGenomesQueued_++
					if (this.maximumGenomesQueued_()) {
						this.logger_.info({numGenomesQueued: this.numGenomesQueued_}, 'Maximum number of genomes queued')
						stream.destroy()
						return
					}
				}

				next()
			})
			.catch(next)
		})
	}

	genomeDataFromRow_(row) {
		let genome = {
			accession: row['# assembly_accession'],
			bioproject: row.bioproject,
			biosample: row.biosample,
			wgs_master: row.wgs_master,
			refseq_category: row.refseq_category,
			taxonomy_id: row.taxid,
			species_taxonomy_id: row.species_taxid,
			name: row.organism_name,
			strain: this.extractStrain_(row.infraspecific_name),
			isolate: row.isolate,
			version_status: row.version_status,
			assembly_level: row.assembly_level,
			release_type: row.release_type,
			release_date: row.seq_rel_date,
			assembly_name: row.asm_name,
			submitter: row.submitter,
			genbank_assembly_accession: row.gbrs_paired_asm,
			ftp_path: row.ftp_path
		}

		for (let key in genome) {
			if (!genome[key])
				genome[key] = null
		}

		return genome
	}

	extractStrain_(infraSpecificName) {
		let matches = /strain=(\S+)/.exec(infraSpecificName)
		return matches ? matches[1] : null
	}

	insertGenome_(genome) {
		return this.sequelize_.transaction((t) => {
			return Promise.all([
				this.existsInGenomes_(genome.accession, t),
				this.alreadyQueued_(genome.accession, t)
			])
			.spread((existsInGenomes, alreadyQueued) => {
				if (existsInGenomes || alreadyQueued)
					return null

				return this.models_.GenomesQueue.create(genome)
			})
		})
	}

	existsInGenomes_(accession, t) {
		return this.models_.Genome.find({
			where: {
				accession
			}
		})
	}

	alreadyQueued_(accession, t) {
		return this.models_.GenomesQueue.find({
			where: {
				accession
			}
		})
	}
}

// --------------------------------------------------------
let enqueuer = new Enqueuer()
enqueuer.main()
