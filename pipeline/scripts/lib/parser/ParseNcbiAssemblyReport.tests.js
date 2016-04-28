'use strict'

let fs = require('fs'),
	path = require('path')

let ParseNcbiAssemblyReport = require('./ParseNcbiAssemblyReport.js')


describe.only('ParseNcbiAssemblyReport', function() {
	it('streaming parser of complete NCBI Assembly Reports', function(done){
		let inputFile = path.resolve(__dirname, 'GCF_000006765.1_ASM676v1_assembly_report.txt'),
			inStream = fs.createReadStream(inputFile),
			parseNcbiAssemblyReport = new ParseNcbiAssemblyReport(),
			results = []

		inStream.pipe(parseNcbiAssemblyReport)
		.on('data', (info) => {
			results.push(info)
		})
		.on('finish', () => {
			expect(results).deep.equal([ 
				{ 	
					name: 'ANONYMOUS',
    				role: 'assembled-molecule',
    				assigned_molecule: 'na',
    				type: 'Chromosome',
    				genbank_accession: 'AE004091.2',
    				genbank_refseq_relationship: '=',
    				refseq_accession: 'NC_002516.2',
    				unit: 'Primary Assembly',
    				undefined: 'na' 
    			} 
    		])
    	done()
		})
	})
})
