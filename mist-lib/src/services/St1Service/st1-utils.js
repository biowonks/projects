'use strict'

// Local
const Region = require('./Region')

// Constants
exports.kTolerance = 10

exports.removeOverlappingDomains = (regionContainer, domains) => {
  domains.sort((a, b) => a.score - b.score)
  for (let i = domains.length - 1; i >= 0; i--) {
    const domain = domains[i]
    const region = new Region(domain.ali_from, domain.ali_to)
    const overlaps = regionContainer.findOverlaps(region, exports.kTolerance)
    if (overlaps.length)
      domains.splice(i, 1)
    else
      regionContainer.add(region)
  }
}
