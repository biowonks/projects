'use strict'

let root = __dirname.split('mist3-api')[0] + "mist3-api",
	fastaInput = process.argv[2],
	output = process.argv[3],
	outputJson = process.argv[4]

let fs = require('fs'),
	assert = require('assert'),
	byline = require('byline'),
	FastaReaderStream = require(root + '/pipeline/scripts/lib/streams/FastaReaderStream')

let fastaReaderStream = new FastaReaderStream(),
	fastaStream = fs.createReadStream(fastaInput)

function line2data(line){

	let values = line.replace(/\s+/g, ' ').split(' ')
	assert(values.length==23,"Line is missing expected 23 values: \n" + line)
	
	let header = values[0],
		seq_len = parseInt(values[2]),
		domain_name = values[3],
		profile_len = parseInt(values[5]),
		c_evalue = parseFloat(values[11]),
		i_evalue = parseFloat(values[12]),
		dom_score = parseFloat(values[13]),
		dom_bias = parseFloat(values[14]),
		hmm_start = parseInt(values[15]),
		hmm_stop = parseInt(values[16]),
		ali_start = parseInt(values[17]),
		ali_stop = parseInt(values[18]),
		env_start = parseInt(values[19]),
		env_stop = parseInt(values[20]),
		acc = parseFloat(values[21]),
		ali_extent = (ali_start > 1 ? '.' : '[') + (ali_stop < seq_len ? '.' : ']'),
		hmm_extent = (hmm_start > 1 ? '.' : '[') + (hmm_stop < profile_len ? '.' : ']'),
		env_extent = (env_start > 1 ? '.' : '[') + (env_stop < seq_len ? '.' : ']')

	let data = [domain_name, ali_start, ali_stop, ali_extent,
		dom_bias, hmm_start, hmm_stop, hmm_extent,
		env_start, env_stop, env_extent,
		dom_score, c_evalue, i_evalue, acc]

	return {"header": header, "data":data}
}

let fastaHeader2seqId = {},
	results = {}

fastaStream.pipe(fastaReaderStream)
.on('data', function(fastaSeq) {
	let header = fastaSeq.header(),
		seqId = fastaSeq.seqId()

	fastaHeader2seqId[header] = seqId
	results[header] = {"_id":seqId, "t":{}}
})
.on('end',function(){


	let inputStream = byline(fs.createReadStream(output, {encoding: 'utf8'}))
	inputStream.on('data', function(line) {
		if (line[0] != "#"){
			let lineData = line2data(line),
				header = lineData.header,
				data = lineData.data,
				seqId = fastaHeader2seqId[header],
				final_data = {"_id":seqId, "t.pfam29":data}

			if (results[header]["t"]["pfam29"]){
				results[header]["t"]["pfam29"].push(data)
			}
			else{
			results[header]["t"] = {"pfam29":[data]}
			}
		}
	})
	.on('end',function(){
		fs.writeFile(outputJson, JSON.stringify(results, null, 2), function(err) {
			if(err) {
				return console.log(err);
			}
			//console.log(JSON.stringify(results, null, 2))})
			console.log("The file was saved!");
		})
	}) 	

})
