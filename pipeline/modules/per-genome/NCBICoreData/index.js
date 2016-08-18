'use strict'

// Core
const assert = require('assert'),
	fs = require('fs'),
	zlib = require('zlib')

// Vendor
const pump = require('pump'),
	streamEach = require('stream-each')

// Local
const PerGenomePipelineModule = require('../../PerGenomePipelineModule'),
	NCBIDataHelper = require('./NCBIDataHelper'),
	AseqsService = require('../../../../services/AseqsService'),
	DseqsService = require('../../../../services/DseqsService'),
	LocationStringParser = require('../../../lib/bio/LocationStringParser'),
	genbankStream = require('../../../lib/streams/genbank-stream'),
	genbankMistStream = require('../../../lib/streams/genbank-mist-stream'),
	mutil = require('../../../lib/mutil'),
	ncbiAssemblyReportStream = require('../../../lib/streams/ncbi-assembly-report-stream')

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
		let noConfig = null
		this.aseqsService_ = new AseqsService(this.models_.Aseq, noConfig, this.logger_)
		this.dseqsService_ = new DseqsService(this.models_.Dseq, noConfig, this.logger_)
		// {RefSeq accession: {}}
		this.assemblyReportMap_ = new Map()

		// Only load one set of references per genome. It appears that most GenBank encoded genomes
		// repeat the same genome references for each "component". To avoid duplicate references,
		// the first set of genome references are the only ones that are "inserted".
		this.loadedGenomeReferences_ = false
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

	parseAndLoadGenome_() {
		let genbankFlatFile = this.fileMapper_.pathFor('genomic-genbank'),
			readStream = fs.createReadStream(genbankFlatFile),
			gunzipStream = zlib.createGunzip(),
			genbankReader = genbankStream(),
			genbankMistReader = genbankMistStream(this.genome_.id),
			index = 0

		pump(readStream, gunzipStream, genbankReader, genbankMistReader)

		// Load the entire genome and its related data in a single transaction. Each "record"
		// returned from the genbankMistReader is a component with its own set of genes, aseqs,
		// etc.
		return this.sequelize_.transaction({
			isolationLevel: 'READ COMMITTED' // Necessary to avoid getting: could not serialize access due to concurrent update errors
		}, (transaction) => {
			return streamEachPromise(genbankMistReader, (mistData, next) => {
				let component = mistData.component,
					tmpLogger = this.logger_.child({
						component: {
							accession: component.accession,
							version: component.version
						},
						index
					})
				++index
				tmpLogger.info('Successfully parsed Genbank record')

				this.loadMistData_(mistData, transaction)
				.then(() => next())
				.catch(next)
			})
		})
	}

	loadMistData_(mistData, transaction) {
		let artificialGeneIds = []
		return Promise.try(() => {
			return this.loadGenomeReferences_(mistData.genomeReferences)
			.then(() => this.loadComponent_(mistData.component, transaction))
			.then((dbComponent) => {
				this.setForeignKeyIds_(mistData.genes, 'component_id', dbComponent.id)
				this.setForeignKeyIds_(mistData.componentFeatures, 'component_id', dbComponent.id)
			})
			.then(() => {
				this.logger_.info(`Loading (ignoring duplicates) ${mistData.geneSeqs.length} gene seqs (dseqs)`)
				return this.dseqsService_.insertIgnoreSeqs(mistData.geneSeqs, transaction)
			})
			.then(() => {
				this.logger_.info(`Loading (ignoring duplicates) ${mistData.proteinSeqs.length} protein seqs (aseqs)`)
				return this.aseqsService_.insertIgnoreSeqs(mistData.proteinSeqs, transaction)
			})
			.then(() => {
				artificialGeneIds = mistData.genes.map((x) => x.id)
				return this.loadGenes_(mistData.genes, transaction)
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
				this.logger_.info(`Loading ${mistData.xrefs.length} xrefs`)
				return this.models_.Xref.bulkCreate(mistData.xrefs, {validate: true, transaction})
			})
			.then(() => {
				this.logger_.info(`Loading ${mistData.componentFeatures.length} component features`)
				this.setIdsToNull_(mistData.componentFeatures)
				return this.models_.ComponentFeature.bulkCreate(mistData.componentFeatures, {
					validate: true,
					transaction
				})
			})
		})
	}

	loadGenomeReferences_(genomeReferences, transaction) {
		if (this.loadedGenomeReferences_)
			return Promise.resolve()

		this.logger_.info(`Loading ${genomeReferences.length} genome references`)
		this.setIdsToNull_(genomeReferences)
		return this.models_.GenomeReference.bulkCreate(genomeReferences, {
			validate: true,
			transaction
		})
		.then(() => {
			this.loadedGenomeReferences_ = true
		})
	}

	loadComponent_(component, transaction) {
		this.logger_.info({dnaLength: component.length}, 'Loading component')
		component.id = null
		this.addAssemblyReportData_(component)
		return this.models_.Component.create(component, {
			transaction
		})
	}

	addAssemblyReportData_(component) {
		let assemblyReport = this.assemblyReportMap_.get(component.accession + '.' + component.version)
		if (!assemblyReport)
			throw new Error('Genbank record does not have corresponding assembly report entry')

		let parts = mutil.parseAccessionVersion(assemblyReport.genbankAccession)
		component.genbank_accession = parts[0]
		component.genbank_version = parts[1]
		component.name = assemblyReport.name
		component.role = assemblyReport.role
		component.assigned_molecule = assemblyReport.assignedMolecule
		component.type = assemblyReport.type
		component.genbank_refseq_relationship = assemblyReport.genbankRefseqRelationship
	}

	loadGenes_(genes, transaction) {
		this.logger_.info(`Loading ${genes.length} genes`)
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
