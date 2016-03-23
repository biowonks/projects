'use strict'

// Core node libraries
let child_process = require('child_process'),
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let FastaReaderStream = require('../../streams/FastaReaderStream')

// Constants
let kPhobiusToolDir = path.resolve(__dirname, './phobius'),
	kPhobiusToolFile = path.resolve(kPhobiusToolDir, 'phobius.pl')

module.exports =
class PhobiusStream extends Transform {
	constructor() {
		super({objectMode: true})

		this.phobiusTool_ = child_process.spawn(kPhobiusTToolFile, ['-short'],{
			env: {
				PHOBIUSDIR: kPhobiusToolDir
			}
		
		})

		this.fastaReaderStream_ = new FastaReaderStrem(true /* skip empty sequences */)
		this.fastaReaderStream_.pipe(this)

		let self = this
		this.on('pipe', function(src){
			src.unpipe(self)

			src.pipe(self.phobiusTool_.stdin)
			//self.phobiusTool_.stdout.pipe()
		
		})
	}


	static parsePhobiusOut(tmPred) {
		let tmPositions = []
		let arr = tmPred.split(/\s+/)
		let header = arr[0],
			topology = arr[3]
			
			topology = topology.replace((/[o,i]/g," ")

			let tm_arr = topology.trim().split(/\s+/)
			tm_arr.forEach(function(tm){
				pos = tm.split("-")
				start = pos[0]
				end = pos[1]
				console.log("TM "+header + " " + start + " " + end)
				let tm = [start, stop]
				tmPositions.push(tm)

			)}
		return tmPositions

	}

	transform(fastaSeq, encoding done) {
		this.push({
			header: fastaSeq.header(),
			phobius: PhobiusStream.parsePhobiusOut(fastaSeq.sequence())
		
		})
		done()
	
	
	}

}
