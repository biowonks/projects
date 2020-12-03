'use strict';

// Local
const { camelize } = require('core-lib/util');

// Constants
const kNCBIPartialSearchForIdUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=biosample&retmax=1000&retmode=json&term=';
const kNCBIPartialBioSampleUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?tool=mistdb&email=biowonks@gmail.com&db=biosample&retmode=text&id=';

module.exports =
class BioSampleService {
  constructor(eutilsService) {
    this.eutilsService = eutilsService;
  }

  async fetchForAccession(accession) {
    if (!accession) {
      throw new Error('missing BioSample accession');
    }

    const url = kNCBIPartialSearchForIdUrl + accession;
    const data = JSON.parse(await this.eutilsService.fetch(url));
    if (!data || !data.esearchresult || !data.esearchresult.idlist || !data.esearchresult.idlist.length) {
      throw new Error('BioSample ID search failed to return any results');
    }

    const bioSampleId = data.esearchresult.idlist[0];
    return this.fetch(bioSampleId);
  }

  async fetch(id) {
    if (!id) {
      throw new Error('missing BioSample id');
    }

    const url = kNCBIPartialBioSampleUrl + id;
    const rawBioSample = await this.eutilsService.fetch(url);
    return this.parseRawResult(id, rawBioSample);
  }

  // Assumes that data is not spread over multiple lines
  parseRawResult(id, rawBioSample) {
    if (typeof rawBioSample !== 'string') {
      throw new Error('wrong input; expected string');
    }

    const lines = rawBioSample.split('\n');
    if (!lines.length) {
      return null;
    }

    const result = {
      id,
      organism: null,
      description: lines.shift(),
      qualifiers: {},
    };
    result.description = result.description.replace(/^\d+: /, '');

    lines.forEach((line) => {
      if (line.startsWith('Organism: ')) {
        result.organism = line.substr('Organism: '.length);
        return;
      }

      if (/^\s+\//.test(line)) {
        // Qualifier
        const lineWithoutLeadingWhitespace = line.replace(/^\s+\//, '');
        const matches = lineWithoutLeadingWhitespace.match(/^(.*?)="(.*)"/);
        if (matches) {
          const key = camelize(matches[1]);
          const value = matches[2];

          result.qualifiers[key] = value;
        }
      }
    });

    return result;
  }
};
