/**
 * This class serves to consolidate all file name mapping in a single location:
 *
 *   URLs
 */

'use strict'

// Core node libraries
let path = require('path')

const kSourceTypes = [
	'checksums',
	'genomic-fasta',
	'protein-fasta',
	'assembly-report',
	'genes-gff',
	'feature-table'
]

class FileNameMapper {
	constructor(config, optGenome) {
		this.config_ = config
		this.genome_ = optGenome
	}

	setGenome(genome) {
		this.genome_ = genome
	}

	corePrefix() {
		if (!this.genome_)
			throw new Error('Genome has not been set. Please call setGenome first')

		return this.genome_.refseq_assembly_accession + '_' + this.genome_.assembly_name
	}

	ftpSourceDirectory() {
		return this.config_.ncbi.ftp.genomeDataRootUrl + '/' + this.corePrefix()
	}

	urlFor(sourceType) {
		return this.ftpSourceDirectory() + '/' + this.fileNameFor(sourceType)
	}

	genomeRootPath() {
		return path.resolve(this.config_.paths.genomes, this.genome_.refseq_assembly_accession)
	}

	pathFor(sourceType) {
		return this.genomeRootPath() + '/' + this.fileNameFor(sourceType)
	}

	/**
	 * Returns a pathless string representing the data file corresponding to sourceType.
	 *
	 * @param {string} sourceType
	 * @return {string}
	 */
	fileNameFor(sourceType) {
		let prefix = this.corePrefix()

		switch (sourceType) {
			case 'checksums':		return 'md5checksums.txt'
			case 'genomic-fasta':	return prefix + '_genomic.fna.gz'
			case 'protein-fasta':	return prefix + '_protein.faa.gz'
			case 'assembly-report':	return prefix + '_assembly_report.txt'
			case 'genes-gff':		return prefix + '_genomic.gff.gz'
			case 'feature-table':	return prefix + '_feature_table.txt.gz'
		}
	}

	sourceTypes() {
		return kSourceTypes
	}
}

module.exports = FileNameMapper
