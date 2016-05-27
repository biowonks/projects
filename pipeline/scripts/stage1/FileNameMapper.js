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

		return `${this.genome_.refseq_assembly_accession}_${this.genome_.assembly_name.replace(/ /g, '_')}`
	}

	ftpSourceDirectory() {
		return this.genome_.ftp_path
	}

	urlFor(sourceType) {
		return `${this.ftpSourceDirectory()}/${this.fileNameFor(sourceType)}`
	}

	genomeRootPath() {
		return path.resolve(this.config_.paths.genomes, this.genome_.refseq_assembly_accession)
	}

	pathFor(sourceType) {
		return `${this.genomeRootPath()}/${this.fileNameFor(sourceType)}`
	}

	idCacheFile() {
		return `${this.genomeRootPath()}/id-blocks.json`
	}

	/**
	 * Returns a pathless string representing the data file corresponding to sourceType.
	 *
	 * @param {string} sourceType type of NCBI data file being analyzed
	 * @returns {string} the relevant file name
	 */
	fileNameFor(sourceType) {
		let prefix = this.corePrefix()

		switch (sourceType) {
			case 'checksums':		return 'md5checksums.txt'
			case 'genomic-fasta':	return `${prefix}_genomic.fna.gz`
			case 'protein-fasta':	return `${prefix}_protein.faa.gz`
			case 'assembly-report':	return `${prefix}_assembly_report.txt`
			case 'genes-gff':		return `${prefix}_genomic.gff.gz`
			case 'feature-table':	return `${prefix}_feature_table.txt.gz`
		}

		throw new Error(`${sourceType} is not supported`)
	}

	sourceTypes() {
		return kSourceTypes
	}
}

module.exports = FileNameMapper
