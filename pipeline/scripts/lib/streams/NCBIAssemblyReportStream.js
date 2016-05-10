/**
 * Parsing of the NCBI RefSeq assembly reports
 * 
 * What does this do !?
 * 
 * The NCBI RefSeq genome dataset is the core source of genomic data. Parsing these data files
 * is a foundational step to this pipeline. In particular, the assembly report file
 * (GCF_...assembly_report.txt) lists "components" (replicons, contigs, etc) belonging to each
 *  genome. The parser is designed to extract this information into a form that may be readily
 *  transformed for insertion into the database (JSON)
 *
 */ 
'use strict'

let Transform = require('stream').Transform,
	StringDecoder = require('string_decoder').StringDecoder

let LineStream = require('./LineStream')

module.exports =
class NCBIAssemblyReportStream extends LineStream {
	constructor() {
		super({objectMode: true})

		this.header_ = null
		this.processedHeader_ = false
		this.buffer_ = ''
		this.decoder_ = new StringDecoder('utf8')
		this.keysCode_ = {
			'Sequence-Name': 'name', 
			'Sequence-Role': 'role',
			'Assigned-Molecule': 'assigned_molecule',
			'Assigned-Molecule-Location/Type': 'type',
			'GenBank-Accn': 'genbank_accession',
			'Relationship': 'genbank_refseq_relationship',
			'RefSeq-Accn': 'refseq_accession',
			'Assembly-Unit': 'unit',
		}
	}
	//------------------------------------------
	// Private methods
	_transform(chunk, encoding, done) {
		let line = this.decoder_.write(chunk)
		if (line[0] === '#') {
				this.header_ = this.parseAssemblyHeader_(line)
			}
		else {
			if (!this.processedHeader_) {
				this.testHeader_()
				this.processedHeader_ = true
			}
			let assemblyInfo = this.parseAssemblyInfo_(line) 
			this.processAssemblyInfo_(assemblyInfo)
		}
		done()
	}

	// ----------------------------------------------------
	// Private methods
	processAssemblyInfo_(assemblyInfo) {
		let result = {}
		for (let i = 0; i < assemblyInfo.length; i++)
			if (this.keysCode_[this.header_[i]])
				result[this.keysCode_[this.header_[i]]] = assemblyInfo[i]
		this.push(result)
	}

	testHeader_() {
		for (let name in this.keysCode_) {
			if (this.header_.indexOf(name) === -1) {
				throw new Error('This assembly report seems to not contain all fields.\nCheck the file or if NCBI changed the format')
			}
		}
	}
	
	parseAssemblyHeader_(line) {
		return line.replace(/\r|\n|#| /gm, '')
			.split('\t')
	}
	
	parseAssemblyInfo_(line) {
		return line.replace(/\r|\n/gm, '')
			.split('\t')
	}
}