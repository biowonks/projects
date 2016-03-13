'use strict'

let output = root + "/pipeline/scripts/lib/tools/hmmer3/out.tbl"

let fs = require('fs'),
	assert = require('assert'),
	byline = require('byline')

function line2data(line){

	let values = line.replace(/\s+/g, ' ').split(' ')
	assert(values.length==23,"Line is missing expected 23 values: \n" + line)
	
	let seq_id = values[0],
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

	return {"seq_id": seq_id, "data":data}
}

let results = {}

let inputStream = byline(fs.createReadStream(output, {encoding: 'utf8'}))
inputStream.on('data', function(line) {
	if (line[0] != "#"){
		let lineData = line2data(line),
			seq_id = lineData.seq_id,
			data = lineData.data

		if (results[seq_id]){
			results[seq_id].push(data)
		}
		else{
		results[seq_id] = [data]
		}
	}
})

inputStream.on('end',function(){console.log(results)})
