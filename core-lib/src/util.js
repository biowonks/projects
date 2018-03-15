'use strict'

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
    .map((word) => word.replace(/[^\w .-]/g, '').trim()) // Allow word characters, spaces, hyphens and periods
    .filter((word) => !!word)
}
