'use strict'

let maxAseqs = 1000

let fs = require('fs'),
	http = require('http'),
	qs = require('querystring'),
	StringDecoder = require('string_decoder').StringDecoder,
	JSONStream = require('JSONStream'),
	async = require('async')

let readStream = fs.createReadStream('./test-data/just12kAseqs.txt'), // , {highWaterMark: 3 * 64 }),
	decoder = new StringDecoder('utf8')

let buf = '\n'

let enoughAseq = function(data) {
	return (data.match(/\n/g) || []).length > maxAseqs + 1
}

let options = {
	host: 'seqdepot.net',
	path: '/api/v1/aseqs?type=aseq_id',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
}
let mySeqData = 0
let allData = []
let httpBuf = ''


let sendRequest = function(chunks) {
	let myData = []
	chunks.forEach((chunk) => {
		let req = http.request(options, (res) => {
			res.on('data', (blob) => {
				console.log('\n\n ***   ****   New batch *** *** ')
				console.log('\nOld stuff')
				console.log(httpBuf + '\n')
				let blobString = blob.toString()
				httpBuf += blobString
				console.log('\nNew stuff\n' + blobString.slice(0, 40))
				console.log('\nEnd of new stuff\n' + blobString.slice(blobString.length - 40, blobString.length - 1))
				console.log('received ' + httpBuf.split('\n').length + ' items\n')
				let htB = httpBuf.split('\n')
				let thisTurn = htB.slice(0, htB.length - 1)
				//console.log('Old   ' + httpBuf)
				httpBuf = htB.slice(htB.length - 1)
				//console.log('Rest   ' + httpBuf)
				console.log(thisTurn)
				let thisData = thisTurn //.split('\n')
				console.log('pre-processed ' + thisData.length + ' items\n')
				thisData.forEach((item) => {
					//console.log('-->   ' + item.split('\t'))
					if (item !== '')
						console.log(item)
						myData.push(JSON.parse(item.split('\t')[3]))
				})
				// console.log(myData)
				// (myData.match(/\n/g) || []).length
				//console.log(myData.length)
			})
			res.on('error', (err) => {
				console.log(err)
			})
			res.on('end', () => {
				// console.log(mySeqmyData)
				// console.log((buf.match(/\n/g) || []).length)
				// readStream.resume()
				console.log('total myData -> ' + myData.length)
				console.log('last myData -> ' + JSON.stringify(myData[myData.length - 1]))
				// console.log(bufaseqs.split('\n').length)
			})
		})
		req.write(chunk)
		req.end()
	})
	// readStream.resume()
	return myData
}

let totalread = ''
readStream.on('data', (chunk) => {
	console.log('buffering')
	buf += decoder.write(chunk)
	if (enoughAseq(buf)) {
		// readStream.pause()
		let chunkAseqs = []
		let chunkPOSTs = []
		while (buf.split('\n').length > maxAseqs + 1) {
			let bufaseqs = buf.split('\n', maxAseqs + 1)
			let lastAseq = bufaseqs[bufaseqs.length - 1]
			bufaseqs = bufaseqs.join('\n')
			console.log('sending a request with ' + (bufaseqs.split('\n').length  - 1) + ' aseqs.')
			buf = buf.slice(bufaseqs.length, buf.length)
			chunkAseqs.push(bufaseqs)
			console.log(lastAseq)
			totalread += bufaseqs
			chunkPOSTs.push(
				function(callback) {
					let myData = []
					let req = http.request(options, (res) => {
						res.on('data', (blob) => {
							console.log('\n\n ***   ****   New batch *** *** ')
							console.log('\nOld stuff')
							console.log(httpBuf + '\n')
							let blobString = blob.toString()
							httpBuf += blobString
							console.log('\nNew stuff\n' + blobString.slice(0, 40))
							console.log('\nEnd of new stuff\n' + blobString.slice(blobString.length - 40, blobString.length - 1))
							console.log('received ' + httpBuf.split('\n').length + ' items\n')
							let htB = httpBuf.split('\n')
							let thisTurn = htB.slice(0, htB.length - 1)
							//console.log('Old   ' + httpBuf)
							httpBuf = htB.slice(htB.length - 1)
							//console.log('Rest   ' + httpBuf)
							console.log(thisTurn)
							let thisData = thisTurn //.split('\n')
							console.log('pre-processed ' + thisData.length + ' items\n')
							thisData.forEach((item) => {
								//console.log('-->   ' + item.split('\t'))
								if (item !== '')
									console.log(item)
									myData.push(JSON.parse(item.split('\t')[3]))
							})
							// console.log(myData)
							// (myData.match(/\n/g) || []).length
							//console.log(myData.length)
						})
						res.on('error', (err) => {
							console.log(err)
						})
						res.on('end', () => {
							// console.log(mySeqmyData)
							// console.log((buf.match(/\n/g) || []).length)
							// readStream.resume()
							console.log('total myData -> ' + myData.length)
							console.log('last myData -> ' + JSON.stringify(myData[myData.length - 1]))
							// console.log(bufaseqs.split('\n').length)
							callback(false, myData)
						})
					})
					req.write(chunk)
					req.end()
				}
			)
		}
		async.waterfall(chunkPOSTs, (err, results) => {
			allData.push(results)
			allData = allData.reduce((a, b) => {
				return a.concat(b)
			})
		})
		console.log(' Data in the vault : ' + allData.length)
	}
})

readStream.on('end', () => {
	console.log('total read: ' + totalread.split('\n').length)
	totalread += buf
	console.log('done here')
	console.log('total read: ' + totalread.split('\n').length)
})

