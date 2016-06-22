/**
 * This class encapsulates file name mapping of all stage 1 files,
 */
'use strict'

// Core
const path = require('path')

module.exports =
class FileMapper {
	/**
	 * @param {String} rootGenomesPath
	 * @param {Object} genome may also be a queued genome
	 */
	constructor(rootGenomesPath, genome) {
		this.rootGenomesPath_ = rootGenomesPath
		this.genome_ = genome
	}

	/**
	 * Returns a pathless string representing the data filename on NCBI corresponding to
	 * ${sourceType}.
	 *
	 * @param {string} sourceType type of NCBI data file being analyzed
	 * @returns {string} the relevant file name
	 */
	fileNameFor(sourceType) {
		let prefix = this.ncbiPrefix()

		switch (sourceType) {
			case 'checksums':		return 'md5checksums.txt'
			case 'genomic-genbank':	return `${prefix}_genomic.gbff.gz`
			case 'genomic-fasta':	return `${prefix}_genomic.fna.gz`
			case 'protein-fasta':	return `${prefix}_protein.faa.gz`
			case 'assembly-report':	return `${prefix}_assembly_report.txt`
			case 'genes-gff':		return `${prefix}_genomic.gff.gz`
			case 'feature-table':	return `${prefix}_feature_table.txt.gz`

			default:
				throw new Error(`${sourceType} is not supported`)
		}
	}

	ncbiPrefix() {
		if (!this.genome_)
			throw new Error('Genome has not been set. Please call setGenome first')

		let urlAssemblyName = this.genome_.assembly_name.replace(/ /g, '_')
		return `${this.genome_.refseq_assembly_accession}_${urlAssemblyName}`
	}

	ncbiUrlFor(sourceType) {
		return `${this.genome_.ftp_path}/${this.fileNameFor(sourceType)}`
	}

	genomeRootPath() {
		return path.resolve(this.rootGenomesPath_, this.genome_.refseq_assembly_accession)
	}

	pathFor(sourceType) {
		return path.resolve(this.genomeRootPath(), this.fileNameFor(sourceType))
	}

	// idCacheFile() {
	// 	return `${this.genomeRootPath()}/id-blocks.json`
	// }
}
