'use strict'

// Core
const fs = require('fs')

// Vendor
const split = require('split')

// Local
const Region = require('./Region')
const RegionContainer = require('./RegionContainer')

// Constants
exports.kTolerance = 10

/**
 * @param {Domain[]} domains
 */
exports.sortByEvalue = (domains) => {
  domains.sort((a, b) => a.evalue - b.evalue)
}

exports.sortByStart = (domains) => {
  domains.sort((a, b) => a.start - b.start)
}

/**
 * @param {RegionContainer} regionContainer
 * @param {Domain[]} domains
 */
exports.removeOverlappingDomains = (regionContainer, domains) => {
  domains.sort((a, b) => a.score - b.score)
  for (let i = domains.length - 1; i >= 0; i--) {
    const domain = domains[i]
    const region = new Region(domain.start, domain.stop)
    const overlaps = regionContainer.findOverlaps(region, exports.kTolerance)
    if (overlaps.length)
      domains.splice(i, 1)
    else
      regionContainer.add(region)
  }
}

/**
 * @param {Domain[]} domains
 * @param {number} threshold
 */
exports.removeInsignificantOverlaps = (domains, threshold = .001) => {
  if (domains.length < 2)
    return

  const regionContainer = new RegionContainer()

  // Sort domains in descending evalue order because we will be iterating
  // over them in reverse to facilitate removal of insignificant overlaps.
  domains.sort((a, b) => b.evalue - a.evalue)

  for (let i = domains.length - 1; i >= 0; i--) {
    const domain = domains[i]
    const region = Region.createFromDomain(domain)
    const overlaps = regionContainer.findOverlaps(region, exports.kTolerance)
      .map((overlap) => overlap.region)
    if (exports.hasInsignificantOverlap(overlaps, domain.evalue, threshold)) {
      // We have overlaps, remove the prediction that is at least epsilon more significant (by evalue)
      // or none otherwise. If there is at least epsilon difference to any of the existing domains,
      // remove it.
      //
      // Safe to assume that the existing evalue already in the container is less than (better) than
      // the current domain/region evalue. This is because we sort by decreasing evalue and iterate
      // through the list backwards (start with the lowest evalue prediction).
      domains.splice(i, 1)
    }
    else
      regionContainer.add(region)
  }
}

// Returns true if any region in ${regions} is more than ${threshold} different than ${queryEvalue};
// false otherwise.
exports.hasInsignificantOverlap = (regions, queryEvalue, threshold = .001) => {
  for (let i = 0, z = regions.length; i < z; i++) {
    const region = regions[i]
    const regionDomain = region.data
    const evalue = regionDomain.evalue
    const isInsignificant = Math.abs(queryEvalue - evalue) > threshold
    if (isInsignificant)
      return true
  }
  return false
}

exports.removeSpecificDomainsOverlappingWith = (domain, targetDomainNameSet, domainsToFilter) => {
  if (!targetDomainNameSet || !domainsToFilter)
    return

  domainsToFilter.sort((a, b) => a.start - b.start)
  for (let i = domainsToFilter.length - 1; i >= 0; i--) {
    const domainToFilter = domainsToFilter[i]
    if (!targetDomainNameSet.has(domainToFilter.name))
      continue

    // Hacky overlap test
    const mid = domainToFilter.start + (domainToFilter.stop - domainToFilter.start) / 2
    if (mid >= domain.start && mid <= domain.stop)
      domainsToFilter.splice(i, 1)
  }
}

/**
 * @param {String} file tab delimited stpi spec file
 * @returns array of hashes
 */
exports.parseSTPSpec = (file) => {
  return new Promise((resolve, reject) => {
    const spec = []
    let headerFields

    fs.createReadStream(file)
      .pipe(split())
      .on('data', (line) => {
        const isEmptyLine = /^\s*$/.test(line)
        if (isEmptyLine)
          return

        if (headerFields) {
          const parts = line.split(/\t/)
          const row = {
            accession: null,
            family: null,
            function: null,
            id: null,
            kind: null,
            marker: false,
            name: null,
          }
          headerFields
            .forEach((fieldName, i) => {
              if (Reflect.has(row, fieldName) && !!parts[i])
                row[fieldName] = parts[i]
            })
          if (row.marker)
            row.marker = true
          spec.push(row)
        } else {
          headerFields = line.split(/\t/)
        }
      })
      .on('error', reject)
      .on('end', () => {
        resolve(spec)
      })
  })
}

exports.setContainsSomeDomains = function(domains, someSet) {
  if (!someSet || !domains)
    return false

  for (let domain of domains) {
    if (someSet.has(domain.name))
      return true
  }
  return false
}
