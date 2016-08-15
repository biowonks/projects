'use strict'

// Core
const assert = require('assert')

// Local
const PerGenomePipelineModule = require('../PerGenomePipelineModule'),
    TaxonomyService = require('../../lib/services/TaxonomyService')

module.exports =
class TaxonomyTableModule extends PerGenomePipelineModule {
	/**
	 *
	 */
    constructor() {
        super()
        this.taxonomyService_ = new TaxonomyService()
    }

    static cli() {
		return {
			description: 'run taxonomy retriever and taxonomy table updater'
        }
    }

    dependencies() {
		return ['NCBICoreData']
	}

    run() {
        return this.taxonomyService_.fetchTaxonomyAndUpdateTable(this.genome_.species_taxonomy_id)
        .then((taxonomyObject) => {
            return this.genome_.update({
                superkingdom: taxonomyObject.superkingdom,
                phylum: taxonomyObject.phylum,
                class: taxonomyObject.class,
                orderr: taxonomyObject.order,
                family: taxonomyObject.family,
                genus: taxonomyObject.genus,
                species: taxonomyObject.species,
                strain: taxonomyObject.strain
                },
                {
                    fields: [
                                'superkingdom',
                                'phylum',
                                'class',
                                'orderr',
                                'family',
                                'genus',
                                'species',
                                'strain']
                })
            .then(() => {
                this.logger_.info('Updated taxonomy fields')
            })
        })
    }
}