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
let fs = require('fs'),
	path = require('path')

// Vendor
let program = require('commander'),
	parse = require('csv-parse'),
	through2 = require('through2'),
	Promise = require('bluebird')

// Local
let mutil = require('../lib/mutil'),
	BootStrapper = require('../../services/BootStrapper'),
	LineStream = require('../lib/streams/LineStream')

program
.description('Enqueues new microbial genomes located at NCBI for integration into the MiST database')
.parse(process.argv)

// --------------------------------------------------------
// Main logic encapsulated in class
class Enqueuer {
	constructor() {
		let config = BootStrapper.config
		this.pipelineConfig_ = config.pipeline
		this.bootStrapper_ = new BootStrapper({
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
		this.logger_ = this.bootStrapper_.logger()
		this.sequelize_ = null
		this.models_ = null
		this.numGenomesQueued_ = 0
	}

	main() {
		this.logger_.info('Start')

		this.bootStrapper_.setup()
		.then(() => {
			this.sequelize_ = this.bootStrapper_.sequelize()
			this.models_ = this.bootStrapper_.models()

			return this.createTemporaryDirectory_()
		})
		.then(this.enqueueNewAssemblies_.bind(this))
		.catch((error) => {
			if (error instanceof BootStrapper.Sequelize.DatabaseError)
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
		return new Promise((resolve, reject) => {
			let parser = parse({
				columns: true,
				delimiter: '\t',
				trim: true,
				relax: true,
				skip_empty_lines: true,
				auto_parse: true
			})

			let stream = fs.createReadStream(file),
				lineStream = new LineStream(),
				skippedFirstLine = false

			stream
			.pipe(lineStream)
			// The assembly summary files have two header lines the first of which is merely descriptive; however,
			// it causes csv-parse to choke because it is looking for the header line. Thus, this through stream
			// skips the first line as well as re-appends the newline character that is stripped by LineStream.
			.pipe(through2({objectMode: true}, function(line, encoding, done) {
				if (skippedFirstLine)
					// The CSV parser expects input with newlines. Here we add them back because the
					// LineStream removes them.
					this.push(line + '\n') // eslint-disable-line no-invalid-this
				else
					skippedFirstLine = true
				done()
			}))
			.pipe(parser)
			.on('error', reject)
			.on('data', (row) => {
				let genomeData = this.genomeDataFromRow_(row)
				if (genomeData.refseq_category !== 'representative genome' && genomeData.refseq_category !== 'reference genome')
					return

				// Counterintuitvely, pausing the fs stream does not actually pause; however, pausing the lienStream
				// does. Here we pause to process this genome into the database.
				lineStream.pause()

				this.insertGenome_(genomeData)
				.then((genome) => {
					if (genome) {
						this.logger_.info({'genome.name': genome.name, refseq_assembly_accession: genome.refseq_assembly_accession}, 'Enqueued new genome')

						this.numGenomesQueued_++
						if (this.maximumGenomesQueued_()) {
							this.logger_.info({numGenomesQueued: this.numGenomesQueued_}, 'Maximum number of genomes queued')
							stream.destroy()
							resolve()
							return
						}
					}

					lineStream.resume()
				})
				.catch((error) => {
					stream.destroy()
					reject(error)
				})
			})
			.on('end', () => {
				resolve()
			})
		})
	}

	genomeDataFromRow_(row) {
		let genome = {
			refseq_assembly_accession: row['# assembly_accession'],
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
				this.existsInGenomes_(genome.refseq_assembly_accession, t),
				this.alreadyQueued_(genome.refseq_assembly_accession, t)
			])
			.spread((existsInGenomes, alreadyQueued) => {
				if (existsInGenomes || alreadyQueued)
					return null

				return this.models_.GenomeQueue.create(genome)
			})
		})
	}

	existsInGenomes_(refseqAssemblyAccession, t) {
		return this.models_.Genome.find({
			where: {
				refseq_assembly_accession: refseqAssemblyAccession
			}
		})
	}

	alreadyQueued_(refseqAssemblyAccession, t) {
		return this.models_.GenomeQueue.find({
			where: {
				refseq_assembly_accession: refseqAssemblyAccession
			}
		})
	}
}

// --------------------------------------------------------
let enqueuer = new Enqueuer()
enqueuer.main()
