/**
 * This class encapsulates file name mapping of all stage 1 files,
 */
'use strict';

// Core
const path = require('path');

module.exports =
class FileMapper {
  /**
	 * @param {String} rootGenomesPath
	 * @param {Object} genome
	 */
  constructor(rootGenomesPath, genome) {
    this.rootGenomesPath_ = rootGenomesPath;
    this.genome_ = genome;
  }

  /**
	 * Returns a pathless string representing the data filename on NCBI corresponding to
	 * ${sourceType}.
	 *
	 * @param {string} sourceType type of NCBI data file being analyzed
	 * @returns {string} the relevant file name
	 */
  localFileNameFor(sourceType) {
    switch (sourceType) {
      case 'checksums':				return 'md5checksums.txt';
      case 'genomic-genbank':			return 'genomic.gbff.gz';
      case 'genomic-fasta':			return 'genomic.fna.gz';
      case 'protein-fasta':			return 'protein.faa.gz';
      case 'assembly-report':			return 'assembly_report.txt';
      case 'genes-gff':				return 'genomic.gff.gz';
      case 'feature-table':			return 'feature_table.txt.gz';

      default:
        throw new Error(`${sourceType} is not supported`);
    }
  }

  ncbiFileNameFor(sourceType) {
    return this.ncbiPrefix() + '_' + this.localFileNameFor(sourceType);
  }

  ncbiPrefix() {
    if (!this.genome_)
      throw new Error('Genome has not been set. Please call setGenome first');

    return this.genome_.ftp_path.split('/').pop();
  }

  ncbiRsyncUrlFor(sourceType) {
    let url = `${this.genome_.ftp_path}/`.replace(/^ftp:/, 'rsync:');
    if (sourceType !== 'checksums')
      url += '*_';
    url += this.localFileNameFor(sourceType);
    return url;
  }

  ncbiHttpsUrlFor(sourceType) {
    let url = `${this.genome_.ftp_path}/`.replace(/^ftp:/, 'https:');
    if (sourceType === 'checksums')
      url += this.localFileNameFor(sourceType);
    else
      url += this.ncbiFileNameFor(sourceType);
    return url;
  }

  genomeRootPath() {
    return path.resolve(this.rootGenomesPath_, this.genome_.version);
  }

  pathFor(sourceType) {
    return path.resolve(this.genomeRootPath(), this.localFileNameFor(sourceType));
  }
};
