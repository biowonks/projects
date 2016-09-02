'use strict'

// Core
const assert = require('assert')

// Local
const mutil = require('mist-lib/mutil'),
	LocationStringParser = require('mist-lib/bio/LocationStringParser'),
	Seq = require('mist-lib/bio/Seq')

// Constants
const kIgnoreGeneQualifierSet = new Set([
		'key',
		'location',
		'locus_tag',
		'old_locus_tag',
		'gene',
		'gene_synonym',
		'pseudo',
		'note',
		'db_xref'
	]),
	kIgnoreCDSQualifierSet = new Set([
		...kIgnoreGeneQualifierSet,
		'product',
		'codon_start',
		'transl_table',
		'translation',
		'protein_id'
	]),
	kIgnoreOtherQualifierSet = new Set([
		'key',
		'location'
	])

/**
 * Extracts data from GenBank record objects and reshapes to the MiST data structure. Arbitrary ids
 * are automatically assigned in a monotonically increasing fashion for each corresponding database
 * table. These sequences continue for the of each adapter instance. Thus, multiple calls to adapt()
 * will continue with identifiers based off of the sequences last values.
 *
 * Though called Genbank, it is important to note that the core data is really from RefSeq, and
 * simply in the GenBank format.
 */
module.exports =
class GenbankMistAdapter {
	/**
	 * @constructor
	 * @param {Number?} genomeId defaults to 1
	 */
	constructor(genomeId = 1) {
		this.locationStringParser_ = new LocationStringParser()
		this.genomeId_ = genomeId

		this.referencesIdSequence_ = mutil.sequence()
		this.componentsIdSequence_ = mutil.sequence()
		this.genesIdSequence_ = mutil.sequence()
		this.xrefsIdSequence_ = mutil.sequence()
		this.componentFeaturesIdSequence_ = mutil.sequence()

		this.mistData_ = null
		this.componentDnaSeq_ = null
		this.geneXrefSet_ = new Set()
	}

	findRefSeqError(genbankRecord) {
		let error = null
		try {
			if (!genbankRecord || typeof genbankRecord !== 'object')
				throw new Error('GenbankRecord must be an object')

			// LOCUS
			let locus = genbankRecord.locus
			if (!locus)
				throw new Error('missing locus')

			if (!locus.name || !locus.bp || !locus.moleculeType || !locus.topology ||
				!locus.divisionCode || !locus.date)
				throw new Error('invalid locus')

			// ACCESSION
			let accession = genbankRecord.accession
			if (!accession)
				throw new Error('missing accession')

			if (!accession.primary ||
				!accession.secondary ||
				!Array.isArray(accession.secondary))
				throw new Error('invalid accession')

			// VERSION
			if (!/^\w+\.[1-9]\d*$/.test(genbankRecord.version))
				throw new Error('invalid version')

			// REFERENCES
			if (!genbankRecord.references || !Array.isArray(genbankRecord.references))
				throw new Error('references must be present and an array')

			// ORIGIN
			if (!genbankRecord.origin)
				throw new Error('missing origin')

			// FEATURES
			if (genbankRecord.features) {
				if (!Array.isArray(genbankRecord.features))
					throw new Error('features must be an array')

				let featureIndex = 0
				for (let feature of genbankRecord.features) {
					if (!feature.key || !feature.location)
						throw new Error(`feature at index ${featureIndex} does not have a key and/or location`)
					++featureIndex
				}
			}
		}
		catch (err) {
			error = err
		}

		return error
	}

	/**
	 * @param {Object} genbankRecord an object representing an entire genbank record such as that
	 *   returned from the genbankStream
	 * @returns {Object} MiST database compatible object
	 */
	formatRefSeq(genbankRecord) {
		let error = this.findRefSeqError(genbankRecord)
		if (error)
			throw error

		this.mistData_ = this.blankEntry_()
		this.formatReferences_(genbankRecord.references)
		this.mistData_.component = this.formatComponent_(genbankRecord)
		this.formatFeatures_(genbankRecord.features)

		// Release internal references
		let result = this.mistData_
		this.mistData_ = null
		this.componentDnaSeq_ = null
		return result
	}

	// ----------------------------------------------------
	// Private methods
	blankEntry_() {
		return {
			genomeReferences: null,
			component: null,
			genes: [],
			xrefs: [],
			componentFeatures: [],

			// The following are collections of Seqs - not instances of the actual models
			geneSeqs: [],
			proteinSeqs: []
		}
	}

	formatReferences_(references) {
		// Sort the references by their number
		references.sort((a, b) => {
			return a.number - b.number
		})

		this.mistData_.genomeReferences = references.map(this.formatReference_.bind(this))
	}

	formatReference_(reference) {
		return {
			id: this.referencesIdSequence_.next().value,
			genome_id: this.genomeId_,
			pubmed_id: reference.pubmed,
			medline_id: reference.medline,
			title: reference.title,
			authors: reference.authors,
			consortium: reference.consortium,
			journal: reference.journal,
			remark: reference.remark,
			notes: reference.notes
		}
	}

	/**
	 * The GenBank parser returns two accession related fields:
	 * a) accession: this is the accession number without any version
	 * b) version: this contains the accession number and version
	 *
	 * In MiST, accessions and their corresponding version numbers are stored in separated fields.
	 *
	 * @param {Object} genbankRecord
	 * @returns {Object}
	 */
	formatComponent_(genbankRecord) {
		this.componentDnaSeq_ = new Seq(genbankRecord.origin)
		this.componentDnaSeq_.normalize()

		return {
			id: this.componentsIdSequence_.next().value,
			genome_id: this.genomeId_,
			accession: genbankRecord.accession.primary,
			version: mutil.parseAccessionVersion(genbankRecord.version)[1] || null,
			genbank_accession: null,
			genbank_version: null,
			name: null,
			role: null,
			assigned_molecule: null,
			type: null,
			genbank_refseq_relationship: null,
			definition: genbankRecord.definition || null,
			molecule_type: genbankRecord.locus.moleculeType || null,
			is_circular: this.isCircular_(genbankRecord),
			annotation_date: genbankRecord.locus.date || null,
			comment: genbankRecord.comment || null,
			dna: this.componentDnaSeq_.sequence(),
			length: this.componentDnaSeq_.length(),
			stats: {}
		}
	}

	isCircular_(genbankRecord) {
		return (genbankRecord.locus.topology === 'circular' || genbankRecord.locus.topology === 'linear') ?
			genbankRecord.locus.topology === 'circular' : null
	}

	formatFeatures_(features) {
		if (!features)
			return

		this.createFeatureLocations_(features)
		this.sortFeatures_(features)

		// Maintain a reference to the last gene data in the event that multiple non-gene features
		// share the same location. Having this reference handy enables linking these additional
		// features to the relevant gene and also providing additional linking for database
		// cross-references.
		let lastGeneData = null

		// A for loop with variables is used below for more easily referencing neighboring features
		// (which are relevant because ${features} is sorted before calling this function).
		for (let i = 0, z = features.length; i < z; i++) {
			let feature = features[i],
				featureData = this.commonFeatureData_(feature)

			if (feature.key === 'gene') {
				let geneData = lastGeneData = featureData
				this.formatGene_(geneData, feature)

				let nextFeature = features[i + 1],
					sameLocation = nextFeature && geneData.location === nextFeature.location,
					sameLocus = nextFeature && geneData.locus && geneData.locus === nextFeature.locus_tag[0]
				if (nextFeature && (sameLocation || sameLocus)) {
					this.formatCognateGeneFeature_(nextFeature, geneData)
					i++ // Skip the next feature since we are linking it with the gene
				}
				else {
					this.geneXrefSet_.clear()
				}

				this.mistData_.genes.push(geneData)
			}
			else {
				let otherData = featureData
				otherData.id = this.componentFeaturesIdSequence_.next().value
				otherData.gene_id = null
				if (lastGeneData && lastGeneData.location === otherData.location) {
					otherData.gene_id = lastGeneData.id
					this.formatXrefs_(feature, otherData.gene_id)
					kIgnoreOtherQualifierSet.add('db_xref')
					this.mergeQualfiers_(otherData, feature, kIgnoreOtherQualifierSet)
					kIgnoreOtherQualifierSet.delete('db_xref')
				}
				else {
					this.geneXrefSet_.clear()
					this.mergeQualfiers_(otherData, feature, kIgnoreOtherQualifierSet)
				}

				this.mistData_.componentFeatures.push(otherData)
			}
		}
	}

	/**
	 * Every feature has a key, location, and optional qualifiers. From the stringified location, it
	 * is possible to ascertain the strand, start, stop, and length.
	 *
	 * @param {Object} feature
	 * @returns {Object}
	 */
	commonFeatureData_(feature) {
		return {
			// The ID is assigned at a later point after determining if this feature is a gene
			// or other feature
			id: null,
			component_id: this.mistData_.component.id,
			key: feature.key,
			location: feature.location,
			strand: feature.$location.strand(),
			start: feature.$location.lowerBound(),
			stop: feature.$location.upperBound(),
			length: feature.$location.length(this.mistData_.component.is_circular, this.mistData_.component.length),
			qualifiers: {}
		}
	}

	/**
	 * Creates a Location object property at $location for each feature.
	 *
	 * @param {Array.<Object>} features
	 */
	createFeatureLocations_(features) {
		for (let feature of features)
			feature.$location = this.locationStringParser_.parse(feature.location)
	}

	/**
	 * Sorts ${features} by:
	 * 1) Location's lower bound position
	 * 2) Gene if matching locus tags
	 * 3) Location length
	 * 4) Actual location string
	 * 5) Gene feature key before all others
	 *
	 * @param {Array.<Object>} features
	 */
	sortFeatures_(features) {
		let isCircular = this.mistData_.component.is_circular,
			componentLength = this.mistData_.component.length

		function geneIfSameLocus(a, b) {
			if (a.locus_tag && b.locus_tag && a.locus_tag[0] === b.locus_tag[0]) {
				if (a.key === 'gene')
					return -1
				else if (b.key === 'gene')
					return 1
			}
			return 0
		}

		features.sort(function(a, b) {
			return a.$location.lowerBound() - b.$location.lowerBound() ||
			geneIfSameLocus(a, b) ||
			a.$location.length(isCircular, componentLength) - b.$location.length(isCircular, componentLength) ||
			a.location.localeCompare(b.location) ||
			(a.key === 'gene' ? -1 : 0) ||
			(b.key === 'gene' ? 1 : 0)
		})
	}

	/**
	 * Maps qualifiers contained in ${feature} to ${geneData} along with creating relevant database
	 * cross-references.
	 *
	 * @param {Object} geneData
	 * @param {Object} feature
	 */
	formatGene_(geneData, feature) {
		Reflect.deleteProperty(geneData, 'key')
		geneData.cognate_qualifiers = {}
		geneData.cognate_key = null

		let geneSeq = feature.$location.transcriptFrom(this.componentDnaSeq_)
		this.mistData_.geneSeqs.push(geneSeq)

		geneData.id = this.genesIdSequence_.next().value
		geneData.dseq_id = geneSeq.seqId()
		geneData.locus = feature.locus_tag ? feature.locus_tag[0] : null
		geneData.old_locus = feature.old_locus_tag ? feature.old_locus_tag[0] : null
		geneData.names = feature.gene || null
		if (feature.gene_synonym) {
			for (let synonym of feature.gene_synonym)
				geneData.names.push(synonym)
		}

		geneData.pseudo = feature.pseudo || false
		geneData.notes = feature.note ? feature.note.join('; ') : null

		geneData.aseq_id = null
		geneData.accession = null
		geneData.version = null
		geneData.translation_table = null
		geneData.codon_start = null
		geneData.product = null

		this.mergeQualfiers_(geneData, feature, kIgnoreGeneQualifierSet)
		this.formatXrefs_(feature, geneData.id)
	}

	/**
	 * @param {Object} target object to assign qualifiers from ${feature}
	 * @param {Object} feature source object to source qualifiers from
	 * @param {Set?} ignoreSet set of qualifier names to ignore when merging qualifiers
	 * @param {String?} qualifierPropertyName defaults to qualifiers
	 */
	mergeQualfiers_(target, feature, ignoreSet = null, qualifierPropertyName = 'qualifiers') {
		assert(qualifierPropertyName in target)

		for (let name in feature) {
			if (name === '$location')
				continue

			let value = feature[name]
			assert(typeof value !== 'undefined' && value !== null, 'qualifier value must be defined and not null')

			if (ignoreSet && ignoreSet.has(name))
				continue

			target[qualifierPropertyName][name] = Array.isArray(value) ? value.join('; ') : value
		}
	}

	/**
	 * Generates xrefs records from feature if any db_xref exists.
	 *
	 * @param {Object} feature
	 * @param {Number} geneId
	 */
	formatXrefs_(feature, geneId) {
		if (!feature.db_xref)
			return

		for (let dbXref of feature.db_xref) {
			let xrefParts = dbXref.split(':'),
				database = xrefParts[0],
				database_id = xrefParts[1] // eslint-disable-line camelcase

			// Ignore GI numbers since they are obsolete / deprecated
			if (database === 'GI')
				continue

			// Have we already observed this xref? Occurs when the same db_xref occurs in both a
			// gene and a cognate feature (one that has the same location)
			if (this.geneXrefSet_.has(dbXref))
				continue

			// Note: these get cleared any time a new feature with a novel location is observed
			this.geneXrefSet_.add(dbXref)

			let xrefData = {
				id: this.xrefsIdSequence_.next().value,
				gene_id: geneId,
				database,
				database_id
			}

			this.mistData_.xrefs.push(xrefData)
		}
	}

	formatCognateGeneFeature_(cognateFeature, geneData) {
		assert(cognateFeature.key !== 'gene', 'two gene features are not permitted to have the same location')
		geneData.cognate_key = cognateFeature.key

		let differentLocationSameLocus = geneData.location !== cognateFeature.location &&
			geneData.locus && geneData.locus === cognateFeature.locus_tag[0]
		if (differentLocationSameLocus)
			geneData.cognate_location = cognateFeature.location

		this.formatXrefs_(cognateFeature, geneData.id)

		if (cognateFeature.key === 'CDS')
			this.formatCognateCDS_(cognateFeature, geneData)
		else
			this.mergeQualfiers_(geneData, cognateFeature, kIgnoreGeneQualifierSet, 'cognate_qualifiers')
	}

	formatCognateCDS_(cdsFeature, geneData) {
		geneData.product = cdsFeature.product ? cdsFeature.product[0] : null
		geneData.codon_start = cdsFeature.codon_start ? Number(cdsFeature.codon_start[0]) : null
		geneData.translation_table = cdsFeature.transl_table ? Number(cdsFeature.transl_table[0]) : null
		if (cdsFeature.translation) {
			let proteinSeq = new Seq(cdsFeature.translation[0])
			proteinSeq.normalize()
			geneData.aseq_id = proteinSeq.seqId()
			this.mistData_.proteinSeqs.push(proteinSeq)
		}

		if (cdsFeature.protein_id)
			[geneData.accession, geneData.version] = mutil.parseAccessionVersion(cdsFeature.protein_id[0])

		this.mergeQualfiers_(geneData, cdsFeature, kIgnoreCDSQualifierSet, 'cognate_qualifiers')
	}
}
