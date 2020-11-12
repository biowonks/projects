/**
 * Parsing of the NCBI RefSeq assembly reports
 *
 * The NCBI RefSeq genome dataset is the core source of genomic data. Parsing these data files
 * is a foundational step to this pipeline. In particular, the assembly report file
 * (GCF_...assembly_report.txt) lists "components" (replicons, contigs, etc) belonging to each
 * genome. This stream encapsulates the parsing of this information.
 */
'use strict';

// Core
const stream = require('stream');
const StringDecoder = require('string_decoder').StringDecoder;

// Vendor
const split = require('split');
const pumpify = require('pumpify');

class NCBIAssemblyReportStream extends stream.Transform {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
    this.decoder_ = new StringDecoder('utf8');

    this.lastLine_ = null;
    this.headerFields_ = null;
    this.processedHeader_ = false;
    this.headerFieldNameMap_ = {
      'Sequence-Name': 'name',
      'Sequence-Role': 'role',
      'Assigned-Molecule': 'assignedMolecule',
      'Assigned-Molecule-Location/Type': 'type',
      'GenBank-Accn': 'genbankAccession',
      Relationship: 'genbankRefseqRelationship',
      'RefSeq-Accn': 'refseqAccession',
      'Assembly-Unit': 'unit',
    };
  }

  //------------------------------------------
  // Private methods
  _transform(rawLine, encoding, done) {
    let line = this.decoder_.write(rawLine);

    // Skip empty lines
    if (!line) {
      done();
      return;
    }

    if (this.isMetadataLine_(line)) {
      if (!this.processedHeader_) {
        this.headerFields_ = this.parseAssemblyHeader_(this.lastLine_);
        if (this.isInvalidHeader_()) {
          done(new Error('Not all fields in assembly report files.'));
          return;
        }
        this.processedHeader_ = true;
      }
      let assemblyInfo = this.parseAssemblyInfo_(line);
      this.processAssemblyInfo_(assemblyInfo);
    }
    this.lastLine_ = line;
    done();
  }

  isMetadataLine_(line) {
    return line[0] !== '#';
  }

  /**
	 * @returns {boolean} true header has all expected field names; false otherwise
	 */
  isInvalidHeader_() {
    for (let name in this.headerFieldNameMap_) {
      if (this.headerFields_.indexOf(name) < 0)
        return true;
    }
    return false;
  }

  parseAssemblyHeader_(line) {
    return line
      .replace(/\r|\n|#| /gm, '')
      .split('\t');
  }

  processAssemblyInfo_(assemblyInfo) {
    let result = {};
    for (let i = 0; i < assemblyInfo.length; i++) {
      if (this.headerFieldNameMap_[this.headerFields_[i]])
        result[this.headerFieldNameMap_[this.headerFields_[i]]] = assemblyInfo[i];
    }
    this.push(result);
  }

  parseAssemblyInfo_(line) {
    return line
      .replace(/\r|\n/gm, '')
      .split('\t');
  }
}

module.exports = function(options) {
  return pumpify.obj(split(), new NCBIAssemblyReportStream(options));
};
