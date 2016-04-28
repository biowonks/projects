'use strict'

let fs = require('fs'),
	path = require('path')

let ParseNcbiAssemblyReport = require('./ParseNcbiAssemblyReport.js')


let inputFile = path.resolve(__dirname, 'GCF_000006765.1_ASM676v1_assembly_report.txt'),
	inStream = fs.createReadStream(inputFile),
	parseNcbiAssemblyReport = new ParseNcbiAssemblyReport(),
	results = []

inStream.pipe(parseNcbiAssemblyReport)
.on('data', (result) => {
	results.push(result)
})