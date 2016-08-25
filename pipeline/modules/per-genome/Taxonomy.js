'use strict'

// Local
const PerGenomePipelineModule = require('../PerGenomePipelineModule'),
	TaxonomyService = require('../../lib/services/TaxonomyService')

module.exports =
class Taxonomy extends PerGenomePipelineModule {
	constructor(app, genome) {
		super(app, genome)
		this.taxonomyService_ = new TaxonomyService(this.models_.Taxonomy, this.logger_)
	}

	static description() {
		return 'run taxonomy retriever and taxonomy table updater'
	}

	static dependencies() {
		return ['NCBICoreData']
	}

	/**
	 * Does not remove any inserted Aseqs / Dseqs :\
	 * @returns {Promise}
	 */
	undo() {
		return this.sequelize_.transaction((transaction) => {
			this.logger_.info('Deleting taxonomy fields from genome record')
			return this.genome_.update({
				superkingdom: null,
				phylum: null,
				class: null,
				order: null,
				family: null,
				genus: null,
				species: null,
				strain: null
			}, {
				fields: [
					'superkingdom',
					'phylum',
					'class',
					'order',
					'family',
					'genus',
					'species',
					'strain'
				]
			})
			.then(() => {
				this.logger_.info('Deleted taxonomy fields')
			})
		})
	}


	run() {
		return this.taxonomyService_.updateTaxonomy(this.genome_.species_taxonomy_id)
		.then((rawTaxonomy) => {
			return this.genome_.update({
				superkingdom: rawTaxonomy.superkingdom,
				phylum: rawTaxonomy.phylum,
				class: rawTaxonomy.class,
				order: rawTaxonomy.order,
				family: rawTaxonomy.family,
				genus: rawTaxonomy.genus,
				species: rawTaxonomy.species,
				strain: rawTaxonomy.strain
			}, {
				fields: [
					'superkingdom',
					'phylum',
					'class',
					'order',
					'family',
					'genus',
					'species',
					'strain'
				]
			})
			.then(() => {
				this.logger_.info('Updated taxonomy fields')
			})
		})
	}
}
