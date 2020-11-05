/**
 * The SeedNewMAGs module applies the same process as SeedNewGenomes but for Metagenome Assembled
 * Genomes (MAGs). The list of available MAGs is currently procured manually from the GOLD database,
 * although could be scripted to scrape this information as it is not available for direct
 * download in bulk.
 *
 * TODO:
 * 1. DRY this implementation with the SeedNewGenomes module.
 * 2. Remove hard-coded targetFile in the mist-pipeline/src/config/index::seedNewMAGs
 */

'use strict'

// Core
const fs = require('fs')
const path = require('path')

// Vendor
const parse = require('csv-parse')
const pumpify = require('pumpify')
const split = require('split')
const streamEach = require('stream-each')
const through2 = require('through2')

// Local
const OncePipelineModule = require('lib/OncePipelineModule')
const generatorUtil = require('core-lib/generator-util')
const mutil = require('mist-lib/mutil')

// Constants
const kBatchSize = 50
const kTempTableName = 'seed_new_mags__summaries'
const kCreateTempTableSql = `CREATE TEMPORARY TABLE ${kTempTableName} (
	accession text not null,
	version text not null,
	version_number integer not null,
	genbank_accession text,
	genbank_version text,
	taxonomy_id integer,
	name text not null,
	refseq_category text,
	bioproject text,
	biosample text,
	wgs_master text,
	strain text,
	isolate text,
	version_status text,
	assembly_level text,
	release_type text,
	release_date date,
	assembly_name text,
	submitter text,
	ftp_path text,
	meta jsonb not null default '{}',

	unique(accession, version)
)`
const kTempTableFields = [
	'accession',
	'version',
	'version_number',
	'genbank_accession',
	'genbank_version',
	'taxonomy_id',
	'name',
	'refseq_category',
	'bioproject',
	'biosample',
	'wgs_master',
	'strain',
	'isolate',
	'version_status',
	'assembly_level',
	'release_type',
	'release_date',
	'assembly_name',
	'submitter',
	'ftp_path',
	'meta'
]

/**
 * Private error used to prematurely exit a Promise.each
 */
class ExitPromiseEachError extends Error {}

module.exports =
class SeedNewMAGs extends OncePipelineModule {
	static description() {
		return 'seed the database with MAGs sourced from NCBI by referenced\n' +
			'externally from a set of Genbank Assembly Accession IDs (e.g. GOLD)'
	}

	static moreInfo() {
		return 'Use the query parameter to only seed those genomes whose name\n' +
		  'matches a regular expression similar to that of. For example:\n' +
			'  -q "coli" will only match those genomes with "coli" in its name\n' +
			'  -q "^Escher" will only match those genomes whose name begins with "Escher"\n\n' +
			'Specify the NDJSON file (use key: \'assemblyAccession\') containing the target\n' +
			'accessions to load'
	}

	constructor(app) {
		super(app)

		this.seedConfig_ = this.config_.seedNewMAGs
		this.numGenomesSeeded_ = 0
		this.dataDir_ = __dirname
		this.QueryGenerator_ = this.models_.Genome.QueryGenerator
		this.queryRegex_ = this.query_ ? new RegExp(this.query_) : null
		this.ndjsonFile = this.seedConfig_.targetFile
	}

	optimize() {
		return this.analyze(this.models_.Genome.tableName)
	}

	run() {
		if (!this.ndjsonFile || !fs.existsSync(this.ndjsonFile)) {
			throw new Error('Missing target file in config. Please add targetFile property to seedNewMAGs and try again.')
		}

		// 1. Index all the accessions
		const readMags = this.readMAGFile_(this.ndjsonFile)
			.then((magsArray) => this.indexMAGsByAccession_(magsArray))
		const downloadAssemblySummary = this.downloadAssemblySummary_(this.seedConfig_.assemblySummaryLink)

		return Promise.all([
			readMags,
			downloadAssemblySummary,
		]).then(([magsByAccession, assemblySummaryFile]) => {
			this.shutdownCheck_()
			return this.processSummaryFile_(assemblySummaryFile, magsByAccession)
		})
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Returns an array of the NDJSON from ${targetFile}.
	 */
	readMAGFile_(targetFile) {
		return new Promise((resolve, reject) => {
			const result = []
			const readStream = fs.createReadStream(targetFile)
			const toJSONStream = through2.obj(function(line, encoding, done) {
				try {
					if (/\S/.test(line)) {
						const data = JSON.parse(line)
						this.push(data)
					}
					done()
				} catch (error) {
					done(error)
				}
			})
			const pipeline = pumpify.obj(readStream, split(), toJSONStream)
			pipeline
				.on('data', (data) => {
					result.push(data)
				})
				.on('error', reject)
				.on('end', () => resolve(result))
		})
	}

	indexMAGsByAccession_(mags) {
		return mags.reduce(
			(index, current) => {
				index[current.assemblyAccession] = current
				return index
			},
			{}
		)
	}

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
	 * Processes the summary file {$file} for new genomes to insert into the database. If ${file}
	 * is null, then nothing is done.
	 *
	 * Because of special path conventions, all input values are initially preserved as strings
	 * rather than relying on the csv_parse.auto_parse option. This is to accommodate looking up
	 * paths on the NCBI FTP server where values like 1.0 or _05864 are converted to the numbers
	 * 1 and 5864, respectively. While apparently innocuous, this now resolves to an invalid
	 * lookup value on the FTP site.
	 *
	 * Examples:
	 * GCF_000261485.1	PRJNA224116	SAMN02469481	AJQT00000000.1	representative genome	716928	716925	Ensifer sojae CCBAU 05684	strain=CCBAU 05684		latest	Contig	Major	Full	2012/05/03	05684	China Agricultural University	GCA_000261485.1	identical	ftp://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/261/485/GCF_000261485.1_05684
	 *
	 * @param {String?} file
	 * @returns {Promise}
	 */
	processSummaryFile_(file, magsByAccession) {
		this.logger_.info({file}, 'Processing summary file')
		const parser = parse({
			columns: true,
			delimiter: '\t',
			trim: true,
			relax: true,
			skip_empty_lines: true,
			auto_parse: false	// do not attempt to convert input strings to native types
		})

		const readStream = fs.createReadStream(file)
		// The assembly summary files have two header lines the first of which is merely
		// descriptive; however, it causes csv-parse to choke because it is looking for the
		// header line. Thus, this through stream skips the first line as well as re-appends the
		// newline character that is stripped by LineStream.
		let skippedFirstLine = false
		const skipLineStream = through2.obj(function(line, encoding, done) {
			if (skippedFirstLine)
				// The CSV parser expects input with newlines. Here we add them back because the
				// LineStream removes them.
				this.push(line + '\n') // eslint-disable-line no-invalid-this
			else
				skippedFirstLine = true
			done()
		})
		let numGenomeSummaries = 0
		const genomeSummaries = []

		return new Promise((resolve, reject) => {
			const pipeline = pumpify.obj(readStream, split(), skipLineStream, parser)
			streamEach(pipeline, (row, next) => {
				this.shutdownCheck_()
				const genomeData = this.genomeDataFromRow_(row)
				if (!!genomeData) {
					numGenomeSummaries++
					const mag = magsByAccession[genomeData.version]
					if (mag && this.matchesQuery_(genomeData.name)) {
						delete mag.assemblyAccession
						delete mag.isPublic
						genomeData.meta = JSON.stringify(mag)
						genomeSummaries.push(genomeData)
					}
				}
				next()
			}, (error) => {
				if (error)
					reject(error)
				else
					resolve()
			})
		})
		.then(() => {
			this.logger_.info(`Read ${numGenomeSummaries} genome summaries`)
			if (genomeSummaries.length)
				this.logger_.info(`Matched ${genomeSummaries.length} genome summaries`)

			return this.createTemporaryTable_()
		})
		.then(() => this.insertNewGenomes_(genomeSummaries))
		.then(this.dropTemporaryTable_.bind(this))
	}

	genomeDataFromRow_(row) {
		const refseqAccessionParts = mutil.parseAccessionVersion(row['# assembly_accession'])
		const genbankAccessionParts = mutil.parseAccessionVersion(row.gbrs_paired_asm)
		const genomeData = {
			accession: refseqAccessionParts[0],
			version: row['# assembly_accession'],
			version_number: refseqAccessionParts[1],
			genbank_accession: genbankAccessionParts[0],
			genbank_version: row.gbrs_paired_asm,
			taxonomy_id: Number(row.taxid),
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
			ftp_path: row.ftp_path,
			meta: null
		}

		for (let key in genomeData) {
			if (!genomeData[key])
				genomeData[key] = null
		}

		return genomeData
	}

	extractStrain_(infraSpecificName) {
		const matches = /strain=(\S+)/.exec(infraSpecificName)
		return matches ? matches[1] : null
	}

	matchesQuery_(name) {
		return !this.queryRegex_ || this.queryRegex_.test(name)
	}

	createTemporaryTable_() {
		return this.sequelize_.query(kCreateTempTableSql)
	}

	insertNewGenomes_(genomeSummaries) {
		return Promise.each(generatorUtil.batch(genomeSummaries, kBatchSize), (genomeSummariesBatch) => {
			this.shutdownCheck_()
			return this.sequelize_.transaction((transaction) => {
				return this.bulkInsertGenomeSummaries_(genomeSummariesBatch, transaction)
				.then(() => this.addNewGenomes_(transaction))
				.then(() => this.truncateTemporaryTable_(transaction))
			})
			.then(() => {
				if (this.maximumGenomesSeeded_())
					throw new ExitPromiseEachError()
			})
		})
		.catch(ExitPromiseEachError, () => {}) // noop
	}

	bulkInsertGenomeSummaries_(genomeSummaries, transaction) {
		const sql = this.QueryGenerator_.bulkInsertQuery(
			kTempTableName,
			genomeSummaries,
			{fields: kTempTableFields},
			kTempTableFields
		)

		return this.sequelize_.query(sql, {transaction})
	}

	addNewGenomes_(transaction) {
		const limit = this.seedConfig_.maxNewGenomesPerRun ?
			Math.max(0, this.seedConfig_.maxNewGenomesPerRun - this.numGenomesSeeded_) :
			null

		const sql = `INSERT INTO ${this.models_.Genome.getTableName()} (${kTempTableFields.join(', ')})
SELECT a.*
FROM ${kTempTableName} a LEFT OUTER JOIN ${this.models_.Genome.getTableName()} b USING (accession, version)
WHERE b.accession is null
${limit ? 'LIMIT ' + limit : ''}
RETURNING *`

		return this.sequelize_.query(sql, {transaction, raw: true})
		.spread((result) => {
			if (!result.length)
				return

			this.numGenomesSeeded_ += result.length
			const newGenomes = result.map((genome) => {
				return {
					id: genome.id,
					accession: genome.accession,
					version: genome.version,
					name: genome.name
				}
			})
			this.logger_.info(newGenomes, `Inserted ${result.length} genome records`)
		})
	}

	truncateTemporaryTable_(transaction) {
		return this.sequelize_.query(`truncate table ${kTempTableName}`, {transaction})
	}

	dropTemporaryTable_() {
		return this.sequelize_.query(`drop table ${kTempTableName}`)
	}
}
