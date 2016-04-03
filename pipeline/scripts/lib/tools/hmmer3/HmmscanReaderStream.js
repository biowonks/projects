'use strict'

let Transform = require('stream').Transform

module.exports =
class hmmscanReaderStream extends Transform{
	constructor(optSkipEmptySequence) {
		super({objectMode: true})
		}
 
	_transform(chunk, encoding, done) {
	     let data = chunk.toString()
	     if (this._lastHmmscanResults) {
	     	data = this._lastHmmscanResults + data
	     }
	 
	     let hmmscanResult = data.split('\n\/\/\n')
	     this._lastHmmscanResults = hmmscanResult.splice(hmmscanResult.length - 1, 1)[0]
	 
	     hmmscanResult.forEach(this.push.bind(this))
	     done()
	}
 
 	/*
	// Not necessary at this point as the last data of the hmmscan result is [ok]
	_flush(done) {
	     if (this._lastHmmscanResults) this.push(this._lastHmmscanResults)
	     this._lastHmmscanResults = null
	     done()
	}
	*/
}
 