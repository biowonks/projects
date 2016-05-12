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

		this.lastLine_ = null
		this.headerFields_ = null
		this.processedHeader_ = false
		this.decoder_ = new StringDecoder('utf8')
		this.headerFieldNameMap_ = {
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
		if (this.isDataLine_(line)) {
			if (!this.processedHeader_) {
				this.headerFields_ = this.parseAssemblyHeader_(this.lastLine_)
				if (this.isInvalidHeader_())
					return done(new Error('Not all fields in assembly report files.'))
				this.processedHeader_ = true
			}
			
			let assemblyInfo = this.parseAssemblyInfo_(line) 
			this.processAssemblyInfo_(assemblyInfo)
		}
		
		this.lastLine_ = line
		done()
	}

	// ----------------------------------------------------
	// Private methods
	isDataLine_(line) {
		return line[0] !== '#'
	}
	
	/**
	 * @returns {boolean} true header has all expected field names; false otherwise
	 */
	isInvalidHeader_() {
		for (let name in this.headerFieldNameMap_)
			if (this.headerFields_.indexOf(name) === -1)
				return true
		
		return false
	}
	
	parseAssemblyHeader_(line) {
		return line.replace(/\r|\n|#| /gm, '').split('\t')
	}
	
	processAssemblyInfo_(assemblyInfo) {
		let result = {}
		for (let i = 0; i < assemblyInfo.length; i++)
			if (this.headerFieldNameMap_[this.headerFields_[i]])
				result[this.headerFieldNameMap_[this.headerFields_[i]]] = assemblyInfo[i]
		this.push(result)
	}
	
	parseAssemblyInfo_(line) {
		return line.replace(/\r|\n/gm, '')
			.split('\t')
	}
}