'use strict'

let fs = require('fs'),
	path = require('path')

let NCBIAssemblyReportStream = require('./NCBIAssemblyReportStream.js')

let inputFile = path.resolve(__dirname, 'GCF_000006765.1_ASM676v1_assembly_report.broken.txt'),
	inStream = fs.createReadStream(inputFile),
	ncbiAssemblyReportStream = new NCBIAssemblyReportStream(),
	results = []
	
inStream.pipe(ncbiAssemblyReportStream)
