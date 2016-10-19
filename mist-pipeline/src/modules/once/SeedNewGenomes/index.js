'use strict'

// Core
const fs = require('fs'),
	path = require('path')

// Vendor
const parse = require('csv-parse'),
	pumpify = require('pumpify'),
	split = require('split'),
	streamEach = require('stream-each'),
	through2 = require('through2')

// Local
const OncePipelineModule = require('lib/OncePipelineModule'),
	mutil = require('mist-lib/mutil')

module.exports =
class SeedNewGenomes extends OncePipelineModule {
	static description() {
		return 'seed the database with genomes sourced from NCBI'
	}

	constructor(app) {
		super(app)

		this.seedConfig_ = this.config_.seedNewGenomes
		this.numGenomesSeeded_ = 0
		this.dataDir_ = __dirname
	}

	optimize() {
		return this.analyze(this.models_.Genome.tableName)
	}

	run() {
		return Promise.each(this.seedConfig_.assemblySummaryLinks, (assemblyLink) => {
			if (this.maximumGenomesSeeded_())
				return null

			return this.downloadAssemblySummary_(assemblyLink)
			.then(this.processSummaryFile_.bind(this))
		})
	}

	// ----------------------------------------------------
	// Private methods
	maximumGenomesSeeded_() {
		return this.seedConfig_.maxNewGenomesPerRun &&
			this.numGenomesSeeded_ >= this.seedConfig_.maxNewGenomesPerRun
	}

	/**
	 * @param {String} link
	 * @returns {Promise}
	 */
	downloadAssemblySummary_(link) {
		let destFile = path.resolve(this.dataDir_, link.fileName)
		return mutil.pathIsYoungerThan(destFile, this.seedConfig_.summaryFileDuration)
		.then((isYounger) => {
			if (isYounger) {
				this.logger_.info({path: destFile}, `Summary file already exists and is younger than ${this.seedConfig_.summaryFileDuration.humanize()}`)
				return destFile
			}

			this.logger_.info({path: destFile}, `Downloading assembly summary: ${link.fileName}`)
			return mutil.download(link.url, destFile)
			.then((downloadResult) => {
				this.logger_.info('Download finished')
				return destFile
			})
		})
	}

	/**
	 * Processes the summary file {$file} for new genomes to insert into the database. If ${file} is
	 * null, then nothing is done.
	 *
	 * @param {String?} file
	 * @returns {Promise}
	 */
	processSummaryFile_(file = null) {
		if (!file)
			return null

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
			})

		return new Promise((resolve, reject) => {
			let pipeline = pumpify.obj(readStream, split(), skipLineStream, parser)
			streamEach(pipeline, (row, next) => {
				this.shutdownCheck_()
				let genomeData = this.genomeDataFromRow_(row)
				if (genomeData.refseq_category !== 'representative genome' &&
					genomeData.refseq_category !== 'reference genome') {
					next()
					return
				}

				this.insertGenome_(genomeData)
				.then((genome) => {
					if (genome) {
						this.logger_.info({
							name: genome.name,
							accession: genome.accession,
							version: genome.version
						}, 'Inserted new genome')

						this.numGenomesSeeded_++
						if (this.maximumGenomesSeeded_()) {
							this.logger_.info({
								numGenomesSeeded: this.numGenomesSeeded_
							}, 'Maximum number of genomes have been seeded')
							stream.destroy()
							resolve()
							return
						}
					}

					next()
				})
				.catch(next)
			}, (error) => {
				if (error)
					reject(error)
				else
					resolve()
			})
		})
	}

	genomeDataFromRow_(row) {
		let refseqAccessionParts = mutil.parseAccessionVersion(row['# assembly_accession']),
			genbankAccessionParts = mutil.parseAccessionVersion(row.gbrs_paired_asm),
			genomeData = {
				accession: refseqAccessionParts[0],
				version: refseqAccessionParts[1],
				genbank_assembly_accession: genbankAccessionParts[0],
				genbank_assembly_version: genbankAccessionParts[1],
				taxonomy_id: row.taxid,
				name: row.organism_name,
				refseq_category: row.refseq_category,
				bioproject: row.bioproject,
				biosample: row.biosample,
				wgs_master: row.wgs_master,
				strain: this.extractStrain_(row.infraspecific_name),
				isolate: row.isolate,
				version_status: row.version_status,
				assembly_level: row.assembly_level,
				release_type: row.release_type,
				release_date: row.seq_rel_date,
				assembly_name: row.asm_name,
				submitter: row.submitter,
				ftp_path: row.ftp_path
			}

		for (let key in genomeData) {
			if (!genomeData[key])
				genomeData[key] = null
		}

		return genomeData
	}

	extractStrain_(infraSpecificName) {
		let matches = /strain=(\S+)/.exec(infraSpecificName)
		return matches ? matches[1] : null
	}

	insertGenome_(genomeData) {
		return this.sequelize_.transaction((transaction) => {
			return this.models_.Genome.find({
				where: {
					accession: genomeData.accession,
					version: genomeData.version
				},
				transaction
			})
			.then((genome) => {
				return !genome ? this.models_.Genome.create(genomeData, {transaction}) : null
			})
		})
	}
}
