'use strict'

// Vendor
const _ = require('lodash')

// Local
const util = require('core-lib/util')

exports.splitIntoQueryTerms = (value) => {
    return util.splitIntoTerms(value).map((term) => `%${term}%`)
}

const modelNamesForOptimization = ["Gene"]

exports.processSearch = (queryValue, target, modelName, textFields, exactMatchFields = null) => {
    if (!queryValue)
        return
    if (!target)
        throw new Error('processSearch must have a defined target')

    const terms = exports.splitIntoQueryTerms(queryValue)
    if (terms.length > 0) {
        if (textFields)
            textFields
            .forEach((fieldName) => {
                _.set(target, `criteria.where.$or.${fieldName}.$ilike.$all`, terms)
            })

        if (modelName && modelNamesForOptimization.includes(modelName)) {
            // don't bother searching against other fields if search term is most probably a [gene] product.
            if (exactMatchFields && terms.length == 1)
                exactMatchFields
                .forEach((fieldName) => {
                    _.set(target, `criteria.where.$or.${fieldName}`, queryValue.trim())
                })
        } else {
            if (exactMatchFields)
                exactMatchFields
                .forEach((fieldName) => {
                    _.set(target, `criteria.where.$or.${fieldName}`, queryValue.trim())
                })
        }
    }
}

exports.processWhereTextCondition = (target, textFields) => {
    if (!target)
        throw new Error('processWhereTextCondition must have a defined target')

    textFields
    .forEach((fieldName) => {
        const queryValue = _.get(target, `criteria.where.${fieldName}`)
        if (queryValue) {
            const terms = exports.splitIntoQueryTerms(queryValue)
            _.set(target, `criteria.where.${fieldName}.$ilike.$all`, terms)
        }
    })
}
