'use strict'

//Core node libraries
let child_process = require('child_process'),
	path = require('path'),
	Transform = require('stream').Transform

// Local includes
let FastaReaderStream = require('../../streams/FastaReaderStream'),
	PhobiusResultStream = require('./PhobiusResultStream')
	
//Constants
let kPhobiusToolDir = path.resolve(__dirname,'phobius'),
	kPhobiusToolFile = path.resolve(kPhobiusToolDir,'./phobius.pl')

module.exports = 
class PhobiusStream extends Transform {
	constructor() {
		super({objectMode: true})
		
		this.phobiusTool_ = child_process.spawn(kPhobiusToolFile,['-short'])

                this.fastaReaderStream_ = new FastaReaderStream(true)
                this.fastaReaderStream_.pipe(this)

		this.phobiusResultStream_ = new PhobiusResultStream()


		let self = this
		this.on('pipe',function(src) {
			src.unpipe(self)

			src.pipe(self.phobiusTool_.stdin)
			//self.phobiusResultStream_ = new PhobiusResultStream()
			self.phobiusTool_.stdout.pipe(self.phobiusResultStream_)

		})

	}

	_transform(result,encoding,done) {
		this.push({result})
		console.log("Final "+result)
		done()
	}
}
