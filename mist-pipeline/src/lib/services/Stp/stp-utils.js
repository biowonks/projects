'use strict';

// Core
const assert = require('assert');

// Local
const {tsvFile2ArrayOfObjects} = require('core-lib/util');
const Region = require('core-lib/bio/Region');
const RegionContainer = require('core-lib/bio/RegionContainer');
const {PrimaryRank, SecondaryRank} = require('mist-lib/services/stp.constants');

// Constants
exports.kTolerance = 10;
const kStpSpecFieldNames = new Set([
  'group_name',
  'accession',
  'name',
  'superfamily',
  'description',
  'function',
  'kind',
  'specific',
  'source',
  'pubmed_ids',
  'pdb_ids',
]);
const kDefaultThreshold = .001;
const kNumIdsToCombine = 3;

/**
 * @param {RegionContainer} regionContainer
 * @param {Domain[]} domains
 */
exports.removeOverlappingDomains = (regionContainer, domains) => {
  domains.sort((a, b) => a.score - b.score);
  for (let i = domains.length - 1; i >= 0; i--) {
    const domain = domains[i];
    const region = new Region(domain.start, domain.stop);
    const overlaps = regionContainer.findOverlaps(region, exports.kTolerance);
    if (overlaps.length)
      domains.splice(i, 1);
    else
      regionContainer.add(region);
  }
};

/**
 * @param {Domain[]} domains
 * @param {number} threshold
 */
exports.removeInsignificantOverlaps = (domains, threshold = kDefaultThreshold) => {
  // eslint-disable-next-line no-magic-numbers
  if (domains.length < 2)
    return;

  const regionContainer = new RegionContainer();

  // Sort domains in descending evalue order because we will be iterating
  // over them in reverse to facilitate removal of insignificant overlaps.
  domains.sort((a, b) => b.evalue - a.evalue);

  for (let i = domains.length - 1; i >= 0; i--) {
    const domain = domains[i];
    const region = Region.createFromDomain(domain);
    const overlaps = regionContainer.findOverlaps(region, exports.kTolerance)
      .map((overlap) => overlap.region);
    if (exports.hasInsignificantOverlap(overlaps, domain.evalue, threshold)) {
      // We have overlaps, remove the prediction that is at least epsilon more significant (by evalue)
      // or none otherwise. If there is at least epsilon difference to any of the existing domains,
      // remove it.
      //
      // Safe to assume that the existing evalue already in the container is less than (better) than
      // the current domain/region evalue. This is because we sort by decreasing evalue and iterate
      // through the list backwards (start with the lowest evalue prediction).
      domains.splice(i, 1);
    }
    else {
      regionContainer.add(region);
    }
  }
};

// Returns true if any region in ${regions} is more than ${threshold} different than ${queryEvalue};
// false otherwise.
exports.hasInsignificantOverlap = (regions, queryEvalue, threshold = kDefaultThreshold) => {
  for (let i = 0, z = regions.length; i < z; i++) {
    const region = regions[i];
    const regionDomain = region.data;
    const evalue = regionDomain.evalue;
    const isInsignificant = Math.abs(queryEvalue - evalue) > threshold;
    if (isInsignificant)
      return true;
  }
  return false;
};

exports.removeSpecificDomainsOverlappingWith = (domain, targetDomainNameSet, domainsToFilter) => {
  if (!targetDomainNameSet || !domainsToFilter)
    return;

  domainsToFilter.sort((a, b) => a.start - b.start);
  for (let i = domainsToFilter.length - 1; i >= 0; i--) {
    const domainToFilter = domainsToFilter[i];
    if (!targetDomainNameSet.has(domainToFilter.name))
      continue;

    // Hacky overlap test
    // eslint-disable-next-line no-magic-numbers
    const mid = domainToFilter.start + (domainToFilter.stop - domainToFilter.start) / 2;
    if (mid >= domain.start && mid <= domain.stop)
      domainsToFilter.splice(i, 1);
  }
};

exports.setContainsSomeDomains = function(domains, someSet) {
  assert(someSet, 'missing required argument');
  if (!domains)
    return false;

  for (let domain of domains) {
    if (someSet.has(domain.name))
      return true;
  }
  return false;
};

/**
 * @param {String} file tab delimited stpi spec file
 * @returns array of hashes
 */
exports.readStpSpecFile = (file) => {
  return tsvFile2ArrayOfObjects(file)
    .then((rows) => {
      rows.forEach((row) => {
        row.group_name = row.group_name || row.name;

        if (row.specific) {
          const specific = row.specific.toLowerCase();
          row.specific = specific === 'yes' || specific === 1 || specific === 'true';
        }
        else {
          row.specific = false;
        }

        row.pubmed_ids = combineIds(row, 'pubmed', kNumIdsToCombine, /^\d+$/);
        row.pdb_ids = combineIds(row, 'pdb', kNumIdsToCombine, /^\S+$/);
      });

      return rows.map((row) => exports.pluck(row, kStpSpecFieldNames));
    });
};

function combineIds(row, prefix, amount, regex) {
  const ids = [];
  for (let i = 1; i <= amount; i++) {
    const fieldName = prefix + i;
    const id = row[fieldName];
    if (id && regex.test(id))
      ids.push(id);
  }
  return ids;
}

exports.pluck = (row, fieldNames) => {
  const result = {};
  fieldNames.forEach((fieldName) => {
    result[fieldName] = Reflect.has(row, fieldName) ? row[fieldName] : null;
  });
  return result;
};

exports.canClassifyChemotaxis = (ranks) => {
  if (!ranks || ranks[0] !== PrimaryRank.chemotaxis)
    return false;

  switch (ranks[1]) {
    case SecondaryRank.chea:
    case SecondaryRank.cheb:
    case SecondaryRank.checx:
    case SecondaryRank.ched:
    case SecondaryRank.cher:
    case SecondaryRank.chev:
    case SecondaryRank.chez:
    case SecondaryRank.mcp:
      return true;

    default:
      return false;
  }
};

exports.isChemotaxis = (summary) => false;
