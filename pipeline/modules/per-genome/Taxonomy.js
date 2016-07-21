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

    taxonomyService = new TaxonomyService()

    static cli() {
		return {
			description: 'run taxonomy retriever and taxonomy table updater'
        }
    }

    dependencies() {
		return ['NCBICoreData']
	}

    run() {
        return TaxonomyService.fetchTaxonomyAndUpdateTable(this.genome_.species.taxonomyId)
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