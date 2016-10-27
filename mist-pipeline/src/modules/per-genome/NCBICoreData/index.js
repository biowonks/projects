'use strict'

// Core
const assert = require('assert'),
	fs = require('fs'),
	zlib = require('zlib')

// Vendor
const pumpify = require('pumpify'),
	streamEach = require('stream-each')

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule'),
	NCBIDataHelper = require('./NCBIDataHelper'),
	AseqsService = require('mist-lib/services/AseqsService'),
	DseqsService = require('mist-lib/services/DseqsService'),
	LocationStringParser = require('mist-lib/bio/LocationStringParser'),
	genbankStream = require('mist-lib/streams/genbank-stream'),
	genbankMistStream = require('lib/streams/genbank-mist-stream'),
	mutil = require('mist-lib/mutil'),
	ncbiAssemblyReportStream = require('lib/streams/ncbi-assembly-report-stream')

// Other
let streamEachPromise = Promise.promisify(streamEach)

module.exports =
class NCBICoreData extends PerGenomePipelineModule {
	static description() {
		return 'load NCBI RefSeq genome data'
	}

	constructor(app, genome) {
		super(app, genome)

		this.ncbiDataHelper_ = new NCBIDataHelper(this.fileMapper_, this.logger_)
		this.locationStringParser_ = new LocationStringParser()
		this.aseqsService_ = new AseqsService(this.models_.Aseq, this.logger_)
		this.dseqsService_ = new DseqsService(this.models_.Dseq, this.logger_)
		// {RefSeq accession: {}}
		this.assemblyReportMap_ = new Map()

		// Only load one set of references per genome. It appears that most GenBank encoded genomes
		// repeat the same genome references for each "component". To avoid duplicate references,
		// the first set of genome references are the only ones that are "inserted".
		this.loadedGenomeReferences_ = false
	}

	needsDataDirectory() {
		return true
	}

	optimize() {
		return this.analyze(
			this.models_.Component.getTableName(),
			this.models_.GenomeReference.getTableName(),
			this.models_.ComponentFeature.getTableName(),
			this.models_.Gene.getTableName(),
			this.models_.Aseq.getTableName(),
			this.models_.Dseq.getTableName(),
			this.models_.Xref.getTableName()
		)
	}

	/**
	 * Does not remove any inserted Aseqs / Dseqs :\
	 * @returns {Promise}
	 */
	undo() {
		return this.sequelize_.transaction((transaction) => {
			this.logger_.info('Deleting genome references')
			return this.models_.GenomeReference.destroy({
				where: {
					genome_id: this.genome_.id
				},
				transaction
			})
			.then(() => {
				this.logger_.info('Deleting genome components (cascades to genes, components_features, etc)')
				return this.models_.Component.destroy({
					where: {
						genome_id: this.genome_.id
					},
					transaction
				})
			})
		})
	}

	run() {
		let self = this
		return Promise.coroutine(function *() {
			// 1. Obtain the core genome files (if not already downloaded and stored locally)
			yield self.download_('assembly-report')
			yield self.download_('genomic-genbank')

			// 2. Index the information from the assembly report
			yield self.indexAssemblyReport_()

			// 3. Parse and load the genomic genbank file
			yield self.parseAndLoadGenome_()
		})()
	}

	// ----------------------------------------------------
	// Private methods
	download_(sourceType) {
		return this.ncbiDataHelper_.isDownloaded(sourceType)
		.then((isDownloaded) => {
			if (!isDownloaded)
				return this.ncbiDataHelper_.download(sourceType)

			return null
		})
		.then(() => this.shutdownCheck_())
	}

	indexAssemblyReport_() {
		return Promise.try(() => {
			let assemblyReportFile = this.fileMapper_.pathFor('assembly-report'),
				readStream = fs.createReadStream(assemblyReportFile),
				ncbiAssemblyReportReader = ncbiAssemblyReportStream(),
				pipeline = pumpify.obj(readStream, ncbiAssemblyReportReader)

			return streamEachPromise(pipeline, (assembly, next) => {
				this.assemblyReportMap_.set(assembly.refseqAccession, assembly)
				next()
			})
			.then(() => {
				this.logger_.info(`Read ${this.assemblyReportMap_.size} row(s) from the assembly report`)
			})
		})
	}

	parseAndLoadGenome_() {
		let genbankFlatFile = this.fileMapper_.pathFor('genomic-genbank'),
			readStream = fs.createReadStream(genbankFlatFile),
			gunzipStream = zlib.createGunzip(),
			genbankReader = genbankStream(),
			genbankMistReader = genbankMistStream(this.genome_.id, this.genome_.version)

		genbankReader.on('error', (error) => {
			this.logger_.fatal(error, 'Genbank reader error')
		})

		// Load the entire genome and its related data in a single transaction. Each "record"
		// returned from the genbankMistReader is a component with its own set of genes, aseqs,
		// etc.
		return this.sequelize_.transaction({
			isolationLevel: 'READ COMMITTED' // Necessary to avoid getting: could not serialize access due to concurrent update errors
		}, (transaction) => {
			let pipeline = pumpify.obj(readStream, gunzipStream, genbankReader, genbankMistReader),
				index = 1

			return streamEachPromise(pipeline, (mistData, next) => {
				let component = mistData.component,
					tmpLogger = this.logger_.child({
						version: component.version,
						index,
						numComponents: this.assemblyReportMap_.size
					})

				++index
				tmpLogger.info('Successfully parsed Genbank record')

				this.loadMistData_(mistData, transaction, tmpLogger)
				.then(() => {
					tmpLogger.info('Finished inserting component')
					next()
				})
				.catch(next)
			})
		})
	}

	loadMistData_(mistData, transaction, logger) {
		let artificialGeneIds = []
		return Promise.try(() => {
			return this.loadGenomeReferences_(mistData.genomeReferences, transaction, logger)
			.then(() => this.loadComponent_(mistData.component, transaction, logger))
			.then((dbComponent) => {
				this.setForeignKeyIds_(mistData.genes, 'component_id', dbComponent.id)
				this.setForeignKeyIds_(mistData.componentFeatures, 'component_id', dbComponent.id)
				let nDseqs = mistData.geneSeqs.length
				if (!nDseqs)
					return null

				logger.info(`Loading (ignoring duplicates) ${mistData.geneSeqs.length} gene seqs (dseqs)`)
				return this.dseqsService_.insertIgnoreSeqs(mistData.geneSeqs, transaction)
			})
			.then(() => {
				let nAseqs = mistData.proteinSeqs.length
				if (!nAseqs)
					return null

				logger.info(`Loading (ignoring duplicates) ${mistData.proteinSeqs.length} protein seqs (aseqs)`)
				return this.aseqsService_.insertIgnoreSeqs(mistData.proteinSeqs, transaction)
			})
			.then(() => {
				artificialGeneIds = mistData.genes.map((x) => x.id)
				return this.loadGenes_(mistData.genes, transaction, logger)
			})
			.then((dbGenes) => {
				assert(dbGenes.length === mistData.genes.length)
				let dbGeneIdMap = new Map()
				artificialGeneIds.forEach((artificialGeneId, i) => {
					dbGeneIdMap.set(artificialGeneId, dbGenes[i].id)
				})
				mistData.xrefs.forEach((xref) => {
					xref.gene_id = dbGeneIdMap.get(xref.gene_id)
				})
				mistData.componentFeatures.forEach((feature) => {
					if (feature.gene_id)
						feature.gene_id = dbGeneIdMap.get(feature.gene_id)
				})
				this.setIdsToNull_(mistData.xrefs)
				let nXrefs = mistData.xrefs.length
				if (!nXrefs)
					return null

				logger.info(`Loading ${mistData.xrefs.length} xrefs`)
				return this.models_.Xref.bulkCreate(mistData.xrefs, {validate: true, transaction})
			})
			.then(() => {
				let nComponentFeatures = mistData.componentFeatures.length
				if (!nComponentFeatures)
					return null

				logger.info(`Loading ${mistData.componentFeatures.length} component features`)
				this.setIdsToNull_(mistData.componentFeatures)
				return this.models_.ComponentFeature.bulkCreate(mistData.componentFeatures, {
					validate: true,
					transaction
				})
			})
		})
	}

	loadGenomeReferences_(genomeReferences, transaction, logger) {
		if (this.loadedGenomeReferences_)
			return Promise.resolve()

		logger.info(`Loading ${genomeReferences.length} genome references`)
		this.setIdsToNull_(genomeReferences)
		return this.models_.GenomeReference.bulkCreate(genomeReferences, {
			validate: true,
			transaction
		})
		.then(() => {
			this.loadedGenomeReferences_ = true
		})
	}

	loadComponent_(component, transaction, logger) {
		logger.info({dnaLength: component.length}, 'Loading component')
		component.id = null
		this.addAssemblyReportData_(component)
		return this.models_.Component.create(component, {
			transaction
		})
	}

	addAssemblyReportData_(component) {
		let assemblyReport = this.assemblyReportMap_.get(component.version)
		if (!assemblyReport)
			throw new Error('Genbank record does not have corresponding assembly report entry')

		/**
		 * In some cases, there is no corresponding GenBank record. For example, take the plasmids
		 * from Escherichia coli UMN026.
		 * ftp://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/026/325/GCF_000026325.1_ASM2632v1/GCF_000026325.1_ASM2632v1_assembly_report.txt
		 *
		 * Both plasmids have 'na' for their GenBank accession, but NC_011749.1, NC_011739.1 for
		 * their RefSeq accessions.
		 *
		 * Thus, parse the GenBank accession only if it is not 'na' (otherwise, the database will
		 * throw a validation error when attempting to save it).
		 */
		if (assemblyReport.genbankAccession !== 'na') {
			let parts = mutil.parseAccessionVersion(assemblyReport.genbankAccession)
			component.genbank_accession = parts[0]
			component.genbank_version = assemblyReport.genbankAccession
		}
		component.name = assemblyReport.name
		component.role = assemblyReport.role
		component.assigned_molecule = assemblyReport.assignedMolecule
		component.type = assemblyReport.type
		component.genbank_refseq_relationship = assemblyReport.genbankRefseqRelationship
	}

	loadGenes_(genes, transaction, logger) {
		if (!genes.length)
			return []

		logger.info(`Loading ${genes.length} genes`)
		this.setIdsToNull_(genes)
		return this.models_.Gene.bulkCreate(genes, {
			validate: true,
			returning: true,
			transaction
		})
	}

	/**
	 * @param {Object|Array.<Object>} value
	 */
	setIdsToNull_(value) {
		if (Array.isArray(value)) {
			value.forEach((x) => {
				x.id = null
			})
		}
		else {
			value.id = null
		}
	}

	setForeignKeyIds_(records, foreignKeyField, foreignKeyId) {
		records.forEach((record) => {
			record[foreignKeyField] = foreignKeyId
		})
	}
}
