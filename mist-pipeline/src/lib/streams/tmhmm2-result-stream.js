'use strict';

// Core
const stream = require('stream'),
  StringDecoder = require('string_decoder').StringDecoder;

// Vendor
const split = require('split'),
  pumpify = require('pumpify');

/**
 * Tmhmm2ResultStream parses the textual output from the TMHMM2 transmembrane prediction tool
 * and streams out all the results for each query sequence.
 */
class Tmhmm2ResultStream extends stream.Transform {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
    this.decoder_ = new StringDecoder('utf8');

    this.queryName_ = null;
  }

  _transform(rawLine, encoding, done) {
    let line = this.decoder_.write(rawLine);
    if (line[0] === '>') {
      this.queryName_ = line.substr(1).trim();
    }
    else if (/^%pred /.test(line)) {
      let result = null;
      try {
        result = this.parsePredLine_(line);
      }
      catch (error) {
        this.queryName_ = null;
        done(error);
        return;
      }

      this.push({
        queryName: this.queryName_,
        topology: result.topology,
        tms: result.tms,
      });

      this.queryName_ = null;
    }

    done();
  }

  parsePredLine_(line) {
    let colonPos = line.indexOf(':');
    if (colonPos === -1)
      throw new Error('%pred line missing colon symbol');

    let predString = line.substr(colonPos + 1).trim(),
      topology = this.parseTopology_(predString),
      tms = topology.filter((x) => x[0] === 'M')
        .map((x) => [x[1], x[2]]);

    return {topology, tms};
  }

  parseTopology_(predString) {
    return predString.split(/\s*,\s*/)
      .map((region) => {
        let matches = /^(\w) (\d+) (\d+)$/.exec(region);
        if (!matches)
          throw new Error(`invalid format for topology segment: ${region}`);

        return [
          matches[1],
          Number(matches[2]),
          Number(matches[3]),
        ];
      });
  }
}

module.exports = function(options) {
  return pumpify.obj(split(), new Tmhmm2ResultStream(options));
};
