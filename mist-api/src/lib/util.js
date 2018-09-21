'use strict'

// Vendor
const _ = require('lodash')

// Local
const util = require('core-lib/util')

exports.splitIntoQueryTerms = (value) => {
    return util.splitIntoTerms(value).map((term) => `%${term}%`)
}

exports.checkQueryAndTarget = (queryValue, target) => {
    queryValue = queryValue && queryValue.trim()
    if (!queryValue)
        return
    if (!target)
        throw new Error('Must have a defined target')
    return queryValue;
}

exports.assignExactMatchCriteria = (queryValue, target, fields) => {
    queryValue = exports.checkQueryAndTarget(queryValue, target)
    const terms = exports.splitIntoQueryTerms(queryValue)
    if (terms.length > 0) {
        if (fields) {
            fields
            .forEach((fieldName) => {
                _.set(target, `criteria.where.$or.${fieldName}`, queryValue)
            })
        }
    }
}

exports.assignInexactMatchCriteria = (queryValue, target, fields) => {
    queryValue = exports.checkQueryAndTarget(queryValue, target)
    const terms = exports.splitIntoQueryTerms(queryValue)
    if (terms.length > 0) {
        if (fields) {
            fields
            .forEach((fieldName) => {
                _.set(target, `criteria.where.$or.${fieldName}.$ilike.$all`, terms)
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
