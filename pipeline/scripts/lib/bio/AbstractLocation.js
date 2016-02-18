'use strict'

module.exports =
class AbstractLocation {
	transcriptFrom(seq) {
		throw new Error('Please override this base-class pure-virtual / interface method')
	}
}
