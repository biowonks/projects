'use strict'

// Core
const assert = require('assert'),
	fs = require('fs'),
	zlib = require('zlib')

// Vendor
const Promise = require('bluebird'),
	pumpify = require('pumpify')

// Local
const streamMixins = require('../../lib/streams/stream-mixins')

module.exports =
class AbstractTask {
	constructor(queuedGenome, context) {
		this.queuedGenome_ = queuedGenome
		this.context_ = context
		this.interruptCheck = context.interruptCheck
		this.fileMapper_ = context.fileMapper
		this.config_ = context.config
		this.logger_ = context.logger
	}

	setup() {
		return Promise.resolve()
	}

	/**
	 * @returns {Promise.<Boolean>}
	 */
	isAlreadyDone() {
		return Promise.resolve(false)
	}

	run() {
		throw new Error('not implemented')
	}

	teardown() {
		return Promise.resolve()
	}

	// ----------------------------------------------------
	// Helper methods
	readStream(path) {
		throw new Error('not implemented')
	}

	promiseWriteStream(...args) {
		return this.promiseWriteStream_(pumpify, ...args)
	}

	promiseWriteStreamObj(...args) {
		return this.promiseWriteStream_(pumpify.obj, ...args)
	}

	promiseWriteStream_(pumpifyFn, ...args) {
		assert(args.length, 'usage: promiseWriteStream([...streams], targetFile)')
		let path = args.pop()
		assert(typeof path === 'string', 'Missing targetFile argument')
		let streams = args
		if (path.endsWith('.gz'))
			streams.push(zlib.createGzip())
		streams.push(fs.createWriteStream(path))

		let stream = streams.length > 1 ? pumpifyFn(...streams) : streams[0]

		streamMixins.writePromise(stream)
		streamMixins.endPromise(stream)

		return stream
	}
}
