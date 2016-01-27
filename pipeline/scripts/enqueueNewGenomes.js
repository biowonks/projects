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

'use strict';

// Core node libraries
let fs = require('fs'),
	path = require('path')

// 3rd-party libraries
let bunyan = require('bunyan'),
	program = require('commander'),
	parse = require('csv-parse'),
	Promise = require('bluebird')

// Local includes
let config = require('../config'),
	mutil = require('./lib/mutil')

program
.description('Enqueues new microbial genomes located at NCBI for integration into MiST3')
.parse(process.argv)

// --------------------------------------------------------
// Main logic encapsulated in class
class Enqueuer {
	constructor() {
		this.tempDir_ = path.resolve(config.paths.tmp, 'enqueuer')
		this.config_ = config.enqueuer
		this.logger_ = bunyan.createLogger({
			name: 'enqueuer',
			streams: [
				{
					level: 'info',
					stream: process.stdout
				},
				{
					level: 'error',
					path: this.config_.logging.errFile
				}
			]
		})
		this.sequelize_ = null
		this.models_ = null
	}

	main() {
		this.logger_.info('Start')

		mutil.initORM(config, this.logger_)
		.then((result) => {
			this.sequelize_ = result.sequelize
			this.models_ = result.models

			return this.createTemporaryDirectory_()
		})
		.then(() => {
			return this.enqueueNewAssemblies_()
		})
		.catch((error) => {
			this.logger_.error('Unexpected error', {error: error, stack: error.stack});
		})
	}

	// ----------------------------------------------------
	// Private helper methods
	createTemporaryDirectory_() {
		return new Promise((resolve, reject) => {
			this.logger_.info('Creating / checking temporary directory', {tempDir: this.tempDir_})
			fs.mkdir(this.tempDir_, (error) => {
				if (error) {
					if (error.code === 'EEXIST')
						return resolve()

					return reject(error)
				}

				this.logger_.info('Created temporary directory', {tempDir: this.tempDir_})
				resolve()
			})
		})
	}

	enqueueNewAssemblies_() {
		return Promise.each(config.ncbi.ftp.assemblySummaryLinks, (assemblyLink) => {
			return this.downloadAssemblySummary_(assemblyLink)
				.then((assemblySummaryFile) => {
					// Read through file and parse
					return this.processSummaryFile(assemblySummaryFile)
				})
		});
	}

	downloadAssemblySummary_(link) {
		let destFile = path.resolve(this.tempDir_, link.filename)
		return mutil.pathIsYoungerThan(destFile, this.config_.summaryDuration)
			.then((isYounger) => {
				if (isYounger) {
					this.logger_.info('Summary file already exists and is younger than ' + this.config_.summaryDuration.humanize(), {path: destFile})
					return destFile
				}

				this.logger_.info('Downloading assembly summary: ' + link.filename, {path: destFile})
				return mutil.download(link.url, destFile)
					.then((downloadResult) => {
						this.logger_.info('Download finished')
						return destFile
					})
			})
	}

	processSummaryFile(file) {
		this.logger_.info('Processing summary file', {file: file})
		return new Promise((resolve, reject) => {
			let parser = parse({
				columns: true,
				delimiter: '\t',
				trim: true,
				relax: true,
				skip_empty_lines: true,
				auto_parse: true
			})

			let stream = fs.createReadStream(file)
			.pipe(parser)
			.on('error', reject)
			.on('data', (row) => {
				stream.pause()
				this.insertGenome_(this.genomeDataFromRow_(row))
				.then((genome) => {
					if (genome) {
						this.logger_.info('Enqueued new genome: ' + genome.name, {name: genome.name, refseq_assembly_accession: genome.refseq_assembly_accession})
					}

					stream.resume()
				})
				.catch((error) => {
					stream.end()
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

		for (let key in genome)
			if (!genome[key])
				genome[key] = null

		return genome
	}

	extractStrain_(infraSpecificName) {
		let matches = /strain=(\S+)/.exec(infraSpecificName)
		return !!matches ? matches[1] : null
	}

	insertGenome_(genome) {
		return this.sequelize_.transaction((t) => {
			return Promise.all([
				this.existsInGenomes_(genome.refseq_assembly_accession, t),
				this.alreadyQueued_(genome.refseq_assembly_accession, t)
			])
			.spread((existsInGenomes, alreadyQueued) => {
				if (existsInGenomes || alreadyQueued)
					return

				return this.models_.GenomeQueue.create(genome)
			})
		})
	}

	existsInGenomes_(refseq_assembly_accession, t) {
		return this.models_.Genome.find({
			where: {
				refseq_assembly_accession: refseq_assembly_accession
			}
		})
	}

	alreadyQueued_(refseq_assembly_accession, t) {
		return this.models_.GenomeQueue.find({
			where: {
				refseq_assembly_accession: refseq_assembly_accession
			}
		})
	}
}

// --------------------------------------------------------
let enqueuer = new Enqueuer()
enqueuer.main()
