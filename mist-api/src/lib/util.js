'use strict'

const assert = require('assert')

// Vendor
const _ = require('lodash')
const Op = require('sequelize').Op

// Local
const util = require('core-lib/util')

exports.splitIntoQueryTerms = (value) => {
    return util.splitIntoTerms(value).map((term) => `%${term}%`)
}

exports.assignExactMatchCriteria = (queryValue, target, fields) => {
    assert(target, "Must have a defind target.")
    const terms = util.splitIntoTerms(queryValue)
    if (terms.length > 0) {
        if (fields) {
            fields
            .forEach((fieldName) => {
                _.set(target, ['criteria', 'where', Op.or, fieldName], terms)
            })
        }
    }
}

exports.assignInexactMatchCriteria = (queryValue, target, fields) => {
    assert(target, "Must have a defind target.")
    const terms = exports.splitIntoQueryTerms(queryValue)
    if (terms.length > 0) {
        if (fields) {
            fields
            .forEach((fieldName) => {
                _.set(target, ['criteria', 'where', Op.or, fieldName, Op.iLike, Op.all], terms)
            })
        }
    }
}

exports.processWhereTextCondition = (target, textFields) => {
    assert(target, "Must have a defind target.")
    textFields
    .forEach((fieldName) => {
        const queryValue = _.get(target, `criteria.where.${fieldName}`)
        if (queryValue) {
            const terms = exports.splitIntoQueryTerms(queryValue)
            if (terms.length > 0)
                _.set(target, ['criteria', 'where', fieldName, Op.iLike, Op.all], terms)
        }
    })
}
