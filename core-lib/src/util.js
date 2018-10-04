'use strict'

// Core
const assert = require('assert')
const fs = require('fs')

// Vendor
const split = require('split')

// Constants
const kDefaultNeighborAmount = 5

/**
 * @param {number} index 1-based, integral position of an entity
 * @param {number} rangeStart 1-based, integer start of range containing index (inclusive)
 * @param {number} rangeStop 1-based, integer stop of range containing index (inclusive)
 * @param {boolean} isCircular true if ${rangeStart}..${rangeStop} is circular and continuous
 * @param {object?} [options = {}]
 * @param {number?} [options.amount = 5] default number of indices to include in both directions relative to ${index}
 * @param {number?} [options.amountBefore = options.amount] number of indices to include that occur before ${index}
 * @param {number?} [options.amountAfter = options.amount] number of indices to include that occur after ${index}
 * @returns {Array.<Array.<number,number>...>} array of 2-tuple 1-based ranges that are neighbors of ${index} and within ${rangeStart}..${rangeStop}; ordered relative to indices before ${index} (taking into account circular indices)
 */
exports.findNeighoringIndices = (index, rangeStart, rangeStop, isCircular, options) => {
  assert(index > 0, 'index must be positive')
  assert(rangeStart > 0, 'rangeStart must be positive')
  assert(rangeStop >= rangeStart, 'rangeStop must be greater than or equal to rangeStart')
  assert(index >= rangeStart, 'index must be greater than or equal to rangeStart')
  assert(index <= rangeStop, 'index must be less than or equal to rangeStop')

  options = options || {}
  const amount = options.amount !== undefined ? options.amount : kDefaultNeighborAmount
  let amountBefore = options.amountBefore !== undefined ? options.amountBefore : amount
  let amountAfter = options.amountAfter !== undefined ? options.amountAfter : amount
  assert(amountBefore >= 0, 'options.amountBefore must be greater than or equal to 0')
  assert(amountAfter >= 0, 'options.amountAfter must be greater than or equal to 0')

  let lowestIndex = index
  let effectiveRangeStop = rangeStop
  const result = []
  if (amountBefore > 0) {
    if (index > rangeStart) {
      const before = Math.max(rangeStart, index - amountBefore);
      const indexRange = [before, index - 1]
      result.push(indexRange)
      const numInRange = indexRange[1] - indexRange[0] + 1
      amountBefore -= numInRange

      // This is needed when considering circular topologies for the amount after
      lowestIndex = before
    }

    // Get any additional ones by wrapping around
    if (isCircular && amountBefore > 0) {
      const before = Math.max(index + 1, rangeStop - amountBefore + 1)
      if (before <= rangeStop) {
        result.unshift([before, rangeStop])
        effectiveRangeStop = before - 1
      }
    }
  }

  if (amountAfter > 0) {
    if (index < effectiveRangeStop) {
      const after = Math.min(index + amountAfter, effectiveRangeStop)
      const indexRange = [index + 1, after]
      result.push(indexRange)
      const numInRange = indexRange[1] - indexRange[0] + 1
      amountAfter -= numInRange
    }

    // Get any additional ones by wrapping around
    if (isCircular && amountAfter > 0 && lowestIndex > rangeStart) {
      const after = Math.min(rangeStart + amountAfter, lowestIndex - 1)
      const indexRange = [rangeStart, after]
      result.push(indexRange)
    }
  }

  return result
}

exports.scrub = (value, invalidRegex = /[^\w .-]/g) => {
  return value ? value.replace(invalidRegex, '').trim() : value
}

exports.splitAndScrubString = (value, delimiter = /\s+/) => {
  const result = []
  if (value === undefined || value === null)
    return result

  value += '' // Convert to string
  return value.split(delimiter)
    .map(exports.scrub)
    .filter((word) => !!word)
}

/**
 * Splits ${value} into terms that are separated by whitespace and preserving
 * simple quoted groups of words (only double quotes - does not handle nested
 * quotes).
 *
 * All non-string values except null and undefined are converted to
 * a string value. Order of matches is not guaranteed to match input
 * order.
 *
 * @param {String} value
 * @returns {Array.<String>}
 */
exports.splitIntoTerms = (value) => {
  const result = []
  if (value === undefined || value === null)
    return result

  value += '' // Convert to string

  const quotedTerms = []
  const valueWithoutQuotedTerms = value.replace(/"([^"]*)"/g, (match, quotedWord) => {
    quotedTerms.push(quotedWord)
    return ''
  })

  return valueWithoutQuotedTerms.split(/\s+/)
    .concat(quotedTerms)
    .map((dirtyWord) => exports.scrub(dirtyWord))
    .filter((word) => !!word)
}

/**
 * @param {string} file input file containing tsv data
 * @returns {Promise.<Object[]>} array of objects that map to the first line containing header fields
 */
exports.tsvFile2ArrayOfObjects = (file) => {
  return new Promise((resolve, reject) => {
    const result = []
    let headerFields

    fs.createReadStream(file)
      .pipe(split())
      .on('data', (line) => {
        const isEmptyLine = /^\s*$/.test(line)
        if (isEmptyLine)
          return

        if (headerFields) {
          const parts = line.split(/\t/)
          const row = {}
          headerFields.forEach((fieldName, i) => {
            row[fieldName] = !!parts[i] ? parts[i].trim() : null
          })

          result.push(row)
        } else {
          headerFields = line.toLowerCase().split(/\t/)
        }
      })
      .on('error', reject)
      .on('end', () => {
        resolve(result)
      })
  })
}
