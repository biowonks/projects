'use strict'

let StringDecoder = require('string_decoder').StringDecoder,
	Transform = require('stream').Transform,
	http = require('http'),
	bunyan = require('bunyan')

module.exports =
class RequestSeqDepot extends Transform {
	constructor() {
		super({objectMode: true})
		this.options = {
			host: 'seqdepot.net',
			path: '/api/v1/aseqs?type=aseq_id',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
		this.allData = ''
		this.buffer = '['
		this.log = bunyan.createLogger({name: 'RequestSeqDepot.app'})
		this.log.info('Starting requests')
		this.chunkNum = 0
	}

	_transform(chunk, enc, done) {
		this.getData(chunk)
			.then((data) => {
				this.chunkNum += data.length
				this.log.info('downloading %s items. Total %s', data.length, this.chunkNum)
				// this.allData.concat(data)
				let strData = JSON.stringify(data)
				if (data) {
					data.forEach((item) => {
						this.push(item)
					})
					// this.push(data)
					/*if (this.buffer === '[')
						this.push(this.buffer)
					else
						this.push(this.buffer + ',')
					this.buffer = strData.slice(1, strData.length - 1)*/
				}
			})
			.then(done)
		// this.push(JSON.stringify(allData))
	}

/*	_flush(done) {
		//console.log(this.allData)
		this.push(this.buffer) // + ']')
		done()
		return
	}*/

	getData(data) {
		return new Promise((resolve, rej) => {
			let myData = [],
				httpBuf = ''
			let req = http.request(this.options, (res) => {
				res.on('data', (blob) => {
					let blobString = blob.toString()
					httpBuf += blobString
					let htB = httpBuf.split('\n')
					let thisTurn = htB.slice(0, htB.length - 1)
					httpBuf = htB.slice(htB.length - 1)
					let thisData = thisTurn //.split('\n')
					thisData.forEach((item) => {
						if (item !== '') {
							let itemFields = item.split('\t'),
								itemToPush = {
									query: itemFields[0],
									httpResponse: itemFields[1],
									aseqId: itemFields[2],
									result: JSON.parse(itemFields[3])
								}
							myData.push(itemToPush)
							// myData.push(item)
						}
					})
				})
				res.on('error', (err) => {
					//rej(err)
					console.log(err)
				})
				res.on('end', () => {
					resolve(myData)
				})
			})
			req.write(data)
			req.end()
		})
	}

}
