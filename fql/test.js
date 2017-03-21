'use strict'

let maxAseqs = 1000

let fs = require('fs'),
	PackInChunks = require('./PackInChunks.js'),
	RequestSeqDepot = require('./RequestSeqDepot.js'),
	FqlStream = require('./FqlStream.js')

let setOfRules = [
	{
		Npos: [
			{
				resource: 'das',
				feature: 'TM',
				count: '{4}'
			}
		],
		pos: [
			{
				resource: 'pfam28',
				feature: 'MCPsignal'
			},
			{
				resource: 'fql',
				feature: '$'
			}
		]
	}
]

let pk = new PackInChunks(maxAseqs),
	sd = new RequestSeqDepot(),
	fqlSt = new FqlStream(setOfRules, maxAseqs)

let readStream = fs.createReadStream('./test-data/GammaPb.chemotaxis.aseqs', {highWaterMark: 5}),
	writeStream = fs.createWriteStream('./test-data/seqDepotInfo.filtered.json')

readStream
	.pipe(pk)
	.pipe(sd)
	.pipe(fqlSt)
	//.pipe(process.stdout)
	.pipe(writeStream)
