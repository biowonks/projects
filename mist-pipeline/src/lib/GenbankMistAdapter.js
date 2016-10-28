'use strict'

// Core
const assert = require('assert')

// Local
const mutil = require('mist-lib/mutil'),
	LocationStringParser = require('mist-lib/bio/LocationStringParser'),
	Seq = require('core-lib/bio/Seq')

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
	 * @param {Number} [genomeId = 1]
	 * @param {String} [genomeVersion = null]
	 */
	constructor(genomeId = 1, genomeVersion = null) {
		this.locationStringParser_ = new LocationStringParser()
		this.genomeId_ = genomeId
		this.genomeVersion_ = genomeVersion

		this.referencesIdSequence_ = mutil.sequence()
		this.componentsIdSequence_ = mutil.sequence()
		this.genesIdSequence_ = mutil.sequence()
		this.xrefsIdSequence_ = mutil.sequence()
		this.componentFeaturesIdSequence_ = mutil.sequence()

		this.mistData_ = null
		this.componentDnaSeq_ = null
		this.geneXrefSet_ = new Set()

		// {location} => [3, 5] - 3 and 5 are indices into the features array that have location
		this.featureIndicesByLocation_ = new Map()
		this.featureIndicesByLocus_ = new Map()
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
	 * Note: this method mutates ${genbankRecord}. Please provide a copy to this method if this
	 * not the desired effect.
	 *
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
		this.clearInternalReferences_()
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
			version: genbankRecord.version,
			version_number: mutil.parseAccessionVersion(genbankRecord.version)[1] || null,
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
		this.indexFeatures_(features)

		// Pass 1: deal with all gene features first in order to assign ids for these
		//         and thus potentially link via their gene id
		features.forEach((feature, i) => {
			if (feature && feature.key === 'gene')
				this.formatGeneFeature_(feature, features, i)
		})

		// Pass 2: deal with all other features next
		features.forEach((feature, i) => {
			if (feature && feature.key !== 'gene')
				this.formatOtherFeature_(feature, features)
		})
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
	 * Index all ${features} by their location. These are stored in this.featureIndicesByLocation_.
	 *
	 * @param {Array} features - array of parsed NCBI features
	 */
	indexFeatures_(features) {
		this.featureIndicesByLocation_.clear()
		this.featureIndicesByLocus_.clear()

		features.forEach((feature, i) => {
			if (this.featureIndicesByLocation_.has(feature.location))
				this.featureIndicesByLocation_.get(feature.location).push(i)
			else
				this.featureIndicesByLocation_.set(feature.location, [i])

			if (!feature.locus_tag || !feature.locus_tag[0])
				return

			let locus = feature.locus_tag[0]
			if (this.featureIndicesByLocus_.has(locus))
				this.featureIndicesByLocus_.get(locus).push(i)
			else
				this.featureIndicesByLocus_.set(locus, [i])
		})
	}

	/**
	 * Formats each gene feature into a corresponding MiST record integrating any cognate CDS
	 * feature.
	 *
	 * @param {Object} geneFeature
	 * @param {Array.<Object>} features
	 * @param {Number} i
	 */
	formatGeneFeature_(geneFeature, features, i) {
		if (this.hasMultipleGenesAtLocation_(geneFeature.location, features))
			throw new Error(`multiple genes cannot share the same location: ${geneFeature.location}`)

		this.geneXrefSet_.clear()
		let geneData = this.commonFeatureData_(geneFeature)
		if (!geneData.locus)
			throw new Error(`gene feature is missing locus_tag: ${geneFeature.location}`)

		this.formatGene_(geneData, geneFeature)
		geneFeature.$id = geneData.id // Useful for associating non-CDS features with the gene

		let cdsFeature = this.takeMatchingCdsFeature_(features, geneData.location)
		if (!cdsFeature) {
			// Associate with the next feature if it is a CDS
			let nextFeature = features[i + 1]
			if (nextFeature && nextFeature.key === 'CDS') {
				cdsFeature = nextFeature
				features[i + 1] = null
			}
		}

		if (cdsFeature) {
			if (!geneFeature.$location.overlaps(cdsFeature.$location, this.mistData_.component.is_circular, this.mistData_.component.length))
				throw new Error(`gene feature location (${geneFeature.location}) does not overlap associated CDS feature location (${cdsFeature.location})`)

			this.formatCognateCDS_(cdsFeature, geneData)
		}

		this.mistData_.genes.push(geneData)
	}

	hasMultipleGenesAtLocation_(location, features) {
		let indices = this.featureIndicesByLocation_.get(location),
			numGenes = 0
		if (indices) {
			indices.forEach((index) => {
				let feature = features[index]
				if (feature && feature.key === 'gene')
					numGenes++
			})
		}

		return numGenes > 1
	}

	/**
	 * @param {Object} feature
	 * @param {Array.<Object>} features
	 */
	formatOtherFeature_(feature, features) {
		let featureData = this.commonFeatureData_(feature),
			geneFeature = this.firstMatchingGeneFeature_(features, featureData.location, featureData.locus)

		featureData.id = this.componentFeaturesIdSequence_.next().value
		featureData.gene_id = null
		if (geneFeature) {
			featureData.gene_id = geneFeature.$id
			this.mergeQualifiers_(featureData, feature, kIgnoreOtherQualifierSet)
		}

		this.mistData_.componentFeatures.push(featureData)
	}

	/**
	 * Replaces with null the first CDS feature that is located at ${location} or is tagged with
	 * ${locus} and returns it.
	 *
	 * @param {Array} features
	 * @param {String} location
	 * @returns {Object}
	 */
	takeMatchingCdsFeature_(features, location) {
		let indicesByLocation = this.featureIndicesByLocation_.get(location) || []

		for (let i of indicesByLocation) {
			let feature = features[i]
			if (feature && feature.key !== 'CDS')
				continue

			features[i] = null
			return feature
		}

		return null
	}

	/**
	 * Returns the first gene feature contained in ${features} that either has an equivalent
	 * ${location} or ${locus}.
	 *
	 * @param {Array} features
	 * @param {String} location
	 * @param {String} [locus = null]
	 * @returns {Object}
	 */
	firstMatchingGeneFeature_(features, location, locus = null) {
		let indicesByLocation = this.featureIndicesByLocation_.get(location) || [],
			indicesByLocus = this.featureIndicesByLocus_.get(locus) || [],
			indices = [...indicesByLocation, ...indicesByLocus]

		for (let i of indices) {
			let feature = features[i]
			if (feature && feature.key === 'gene')
				return feature
		}

		return null
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
			locus: feature.locus_tag ? feature.locus_tag[0] : null,
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
	 * Maps qualifiers contained in ${feature} to ${geneData} along with creating relevant database
	 * cross-references.
	 *
	 * @param {Object} geneData
	 * @param {Object} feature
	 */
	formatGene_(geneData, feature) {
		Reflect.deleteProperty(geneData, 'key')
		geneData.cds_qualifiers = {}

		let geneSeq = feature.$location.transcriptFrom(this.componentDnaSeq_)
		this.mistData_.geneSeqs.push(geneSeq)

		geneData.id = this.genesIdSequence_.next().value
		geneData.stable_id = this.genomeVersion_ ? this.genomeVersion_ + '-' + geneData.locus : null
		geneData.dseq_id = geneSeq.seqId()
		geneData.old_locus = feature.old_locus_tag ? feature.old_locus_tag[0] : null
		geneData.names = feature.gene || null
		if (feature.gene_synonym) {
			if (!geneData.names)
				geneData.names = []
			for (let synonym of feature.gene_synonym)
				geneData.names.push(synonym)
		}

		geneData.pseudo = feature.pseudo || false
		geneData.notes = feature.note ? feature.note.join('; ') : null

		geneData.aseq_id = null
		geneData.accession = null
		geneData.version = null
		geneData.product = null
		geneData.codon_start = null
		geneData.translation_table = null

		geneData.cds_location = null
		geneData.cds_qualifiers = {}

		this.mergeQualifiers_(geneData, feature, kIgnoreGeneQualifierSet)
		this.formatXrefs_(feature, geneData.id)
	}

	/**
	 * @param {Object} target object to assign qualifiers from ${feature}
	 * @param {Object} feature source object to source qualifiers from
	 * @param {Set?} ignoreSet set of qualifier names to ignore when merging qualifiers
	 * @param {String?} qualifierPropertyName defaults to qualifiers
	 */
	mergeQualifiers_(target, feature, ignoreSet = null, qualifierPropertyName = 'qualifiers') {
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
			// Have we already observed this xref? Occurs when the same db_xref occurs in both a
			// gene and a cognate feature (one that has the same location)
			if (this.geneXrefSet_.has(dbXref))
				continue

			let xrefParts = dbXref.split(':'),
				database = xrefParts[0],
				database_id = xrefParts[1] // eslint-disable-line camelcase

			// Ignore GI numbers since they are obsolete / deprecated
			if (database === 'GI')
				continue

			// Note: these get cleared with each new gene feature
			this.geneXrefSet_.add(dbXref)

			this.mistData_.xrefs.push({
				id: this.xrefsIdSequence_.next().value,
				gene_id: geneId,
				database,
				database_id
			})
		}
	}

	formatCognateCDS_(cdsFeature, geneData) {
		geneData.cds_location = cdsFeature.location
		geneData.product = cdsFeature.product ? cdsFeature.product[0] : null
		geneData.codon_start = cdsFeature.codon_start ? Number(cdsFeature.codon_start[0]) : null
		geneData.translation_table = cdsFeature.transl_table ? Number(cdsFeature.transl_table[0]) : null
		if (cdsFeature.translation) {
			let proteinSeq = new Seq(cdsFeature.translation[0])
			proteinSeq.normalize()
			geneData.aseq_id = proteinSeq.seqId()
			this.mistData_.proteinSeqs.push(proteinSeq)
		}

		if (cdsFeature.protein_id) {
			geneData.accession = mutil.parseAccessionVersion(cdsFeature.protein_id[0])[0]
			geneData.version = cdsFeature.protein_id[0]
		}

		this.mergeQualifiers_(geneData, cdsFeature, kIgnoreCDSQualifierSet, 'cds_qualifiers')
		this.formatXrefs_(cdsFeature, geneData.id)
	}

	clearInternalReferences_() {
		this.mistData_ = null
		this.componentDnaSeq_ = null
		this.geneXrefSet_.clear()
		this.featureIndicesByLocation_.clear()
		this.featureIndicesByLocus_.clear()
	}
}
