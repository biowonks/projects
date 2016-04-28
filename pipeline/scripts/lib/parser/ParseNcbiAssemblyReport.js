'use strict'

let Transform = require('stream').Transform,
	StringDecoder = require('string_decoder').StringDecoder

let kRecordSeparator = '\n'

module.exports =
class ParseNcbiAssemblyReport extends Transform {
		constructor() {
			super({objectMode: true})

			this.buffer_ = ''
			this.decoder_ = new StringDecoder('utf8')
			this.keysCode = { 	'Sequence-Name' : 'name', 
							'Sequence-Role' : 'role',
							'Assigned-Molecule' : 'assigned_molecule',
							'Assigned-Molecule-Location/Type' : 'type',
							'GenBank-Accn' : 'genbank_accession',
							'Relationship' : 'genbank_refseq_relationship',
							'RefSeq-Accn' : 'refseq_accession',
							'Assembly-Unit' : 'unit',
						}
			this.keys = [ 	'Sequence-Name', 
							'Sequence-Role',
							'Assigned-Molecule',
							'Assigned-Molecule-Location/Type',
							'GenBank-Accn',
							'Relationship',
							'RefSeq-Accn',
							'Assembly-Unit',
						]
		}
		//------------------------------------------
		// Private methods
		/*_flush(done) {
			if (!this.buffer_.length)
				this.throwEmptyFile_()
				return done()

			console.log(this.buffer_)

		}*/
		_transform(chunk, encoding, done) {
			this.buffer_ += this.decoder_.write(chunk)

			let lastPos = 0,
				pos = this.buffer_.indexOf(kRecordSeparator, lastPos),
				header = ['init'],
				AssemblyInfo = []

			while (pos >= 0 ) {
				//console.log(this.buffer_.substr(lastPos, pos))
				//console.log( this.buffer_.substr(lastPos, pos).split('\t').length)
				//console.log( '\n' + lastPos + '\t' + pos + '\n')
				if (this.buffer_[lastPos] === '#'){
					header = this.buffer_.substr(lastPos, pos - lastPos ).replace(/(\r\n|\n|\r|# )/gm,'').split('\t')
				}
				else {
					AssemblyInfo.push(this.buffer_.substr(lastPos, pos - lastPos).replace(/(\r\n|\n|\r)/gm,'').split('\t'))
				}
		
				lastPos = pos + 1
				pos = this.buffer_.indexOf(kRecordSeparator, lastPos)
		
			}
			this.testHeader_(header)
			this.processAssemblyInfo_( header, AssemblyInfo)
			done()
		}

		processAssemblyInfo_(header, AssemblyInfo) {
			let info = []	
			for ( let i = 0; i < AssemblyInfo.length; i++) {
				let result = {}
				for (let j = 0 ; j < AssemblyInfo[i].length; j++) {
					result[this.keysCode[header[j]]] = AssemblyInfo[i][j]
				}
				info.push(result)
			}	
			console.log(info)
		}

		testHeader_(header) {
			for ( let name in this.keysCode ) {
				if ( header.indexOf(name) === -1 ) {
					throw new Error('This assembly report seems to not contain all fields.\nCheck the file or if NCBI changed the format')
				}
			}
		}

		throwEmptyFile_() {
			throw new Error('File is Empty')
		}

}
