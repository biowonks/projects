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
                kingdom: taxonomyObject.kingdom
                }, {fields: 'kingdom'})
            .then(() => {
                this.logger_.info('Updated taxonomy fields')
            })
        })
    }
}