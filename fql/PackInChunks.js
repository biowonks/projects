'use strict'

let StringDecoder = require('string_decoder').StringDecoder,
	Transform = require('stream').Transform


module.exports =
class PackInChunks extends Transform {
	constructor(packSize) {
		super({objectMode: true})

		this.decoder_ = new StringDecoder('utf8')
		this.packSize = packSize
		this.buffer = ''
		this.buffPack = []
	}

	_transform(chunk, enc, done) {
		let buffer = this.buffer + this.decoder_.write(chunk),
			packs = this.buffPack.concat(buffer.split('\n'))

		if (buffer[buffer.length - 1] !== '\n' || packs[packs.length - 1] === '') {
			this.buffer = packs.pop()
		}

		while (packs.length >= this.packSize) {
			let toGoPack = '\n' + packs.splice(0, this.packSize).join('\n')
			this.push(toGoPack)
		}
		this.buffPack = packs
		done()
	}

	_flush(done) {
		let buffer = this.buffer,
			packs = this.buffPack.concat(buffer.split('\n'))
		while (this.buffPack.length >= this.packSize)
			this.push('\n' + packs.splice(0, this.packSize).join('\n'))
		this.push('\n' + packs.join('\n'))
		done()
	}
}
