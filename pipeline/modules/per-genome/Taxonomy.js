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

	undo() {
		this.logger_.info('Taxonomy undo does nothing.')
	}

	run() {
		return this.taxonomyService_.updateTaxonomy(this.genome_.species_taxonomy_id)
		.then((rawTaxonomy) => {
			return this.genome_.update({
				superkingdom: rawTaxonomy.superkingdom,
				phylum: rawTaxonomy.phylum,
				class: rawTaxonomy.class,
				orderr: rawTaxonomy.order,
				family: rawTaxonomy.family,
				genus: rawTaxonomy.genus,
				species: rawTaxonomy.species,
				strain: rawTaxonomy.strain
			}, {
				fields: [
					'superkingdom',
					'phylum',
					'class',
					'orderr',
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
