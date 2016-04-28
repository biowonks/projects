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
    			} 
    		])
    	done()
		})
	})
	it('streaming parser of scaffold NCBI Assembly Reports', function(done){
		let inputFile = path.resolve(__dirname, 'GCF_000392755.1_Ente_faec_SF6375_V1_assembly_report.txt'),
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
				    'name': 'acHWB-supercont1.1',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944513.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944513.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.10',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944514.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944514.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.11',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944515.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944515.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.12',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944516.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944516.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.13',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944517.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944517.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.14',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944518.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944518.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.15',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944519.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944519.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.16',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944520.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944520.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.17',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944521.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944521.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.18',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944522.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944522.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.19',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944523.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944523.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.2',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944524.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944524.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.20',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944525.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944525.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.21',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944526.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944526.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.22',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944527.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944527.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.23',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944528.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944528.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.24',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944529.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944529.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.25',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944530.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944530.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.26',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944531.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944531.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.27',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944532.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944532.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.28',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944533.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944533.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.3',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944534.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944534.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.4',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944535.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944535.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.5',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944536.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944536.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.6',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944537.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944537.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.7',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944538.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944538.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.8',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944539.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944539.1',
				    'unit': 'Primary Assembly' 
				},
				{
				    'name': 'acHWB-supercont1.9',
				    'role': 'unplaced-scaffold',
				    'assigned_molecule': 'na',
				    'type': 'na',
				    'genbank_accession': 'KB944540.1',
				    'genbank_refseq_relationship': '=',
				    'refseq_accession': 'NZ_KB944540.1',
				    'unit': 'Primary Assembly' 
				}
    		])
    	done()
		})
	})
})
