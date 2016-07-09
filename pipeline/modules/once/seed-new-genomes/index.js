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
const mutil = require('../../../lib/mutil')

module.exports = function(app) {
	let {config, logger, models, sequelize} = app,
		thisConfig = config.pipeline.seedNewGenomes,
		numGenomesQueued = 0

	return Promise.each(thisConfig.assemblySummaryLinks, (assemblyLink) => {
		if (maximumGenomesQueued())
			return null

		return downloadAssemblySummary(assemblyLink)
		.then(processSummaryFile)
	})

	function maximumGenomesQueued() {
		return thisConfig.maxNewGenomesPerRun &&
			numGenomesQueued >= thisConfig.maxNewGenomesPerRun
	}

	function downloadAssemblySummary(link) {
		let destFile = path.resolve(__dirname, link.fileName)
		return mutil.pathIsYoungerThan(destFile, thisConfig.summaryFileDuration)
		.then((isYounger) => {
			if (isYounger) {
				logger.info({path: destFile}, `Summary file already exists and is younger than ${thisConfig.summaryFileDuration.humanize()}`)
				return destFile
			}

			logger.info({path: destFile}, `Downloading assembly summary: ${link.fileName}`)
			return mutil.download(link.url, destFile)
			.then((downloadResult) => {
				logger.info('Download finished')
				return destFile
			})
		})
	}

	function processSummaryFile(file) {
		logger.info({file}, 'Processing summary file')
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

		return new Promise((resolve, reject) => {
			streamEach(stream, (row, next) => {
				let genomeData = genomeDataFromRow(row)
				if (genomeData.refseq_category !== 'representative genome' &&
					genomeData.refseq_category !== 'reference genome') {
					next()
					return
				}

				insertGenome(genomeData)
				.then((genome) => {
					if (genome) {
						logger.info({name: genome.name, accession: genome.accession, version: genome.version}, 'Inserted new genome')

						numGenomesQueued++
						if (maximumGenomesQueued()) {
							logger.info({numGenomesQueued}, 'Maximum number of genomes inserted')
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

	function genomeDataFromRow(row) {
		let refseqAccessionParts = mutil.parseAccessionVersion(row['# assembly_accession']),
			genbankAccessionParts = mutil.parseAccessionVersion(row.gbrs_paired_asm)

		let genomeData = {
			accession: refseqAccessionParts[0],
			version: refseqAccessionParts[1],
			genbank_assembly_accession: genbankAccessionParts[0],
			genbank_assembly_version: genbankAccessionParts[1],
			taxonomy_id: row.taxid,
			species_taxonomy_id: row.species_taxid,
			name: row.organism_name,
			refseq_category: row.refseq_category,
			bioproject: row.bioproject,
			biosample: row.biosample,
			wgs_master: row.wgs_master,
			strain: extractStrain(row.infraspecific_name),
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

	function extractStrain(infraSpecificName) {
		let matches = /strain=(\S+)/.exec(infraSpecificName)
		return matches ? matches[1] : null
	}

	function insertGenome(genomeData) {
		return sequelize.transaction(() => {
			return models.Genome.find({
				where: {
					accession: genomeData.accession,
					version: genomeData.version
				}
			})
			.then((genome) => {
				return !genome ? models.Genome.create(genomeData) : null
			})
		})
	}
}
