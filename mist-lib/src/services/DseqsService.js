'use strict'

// Local
const AbstractSeqsService = require('./AbstractSeqsService')

module.exports =
class DseqsService extends AbstractSeqsService {
	insertIgnoreSeqs(seqs, transaction) {
		return super.insertIgnoreSeqs(seqs, ['id', 'length', 'gc_percent', 'sequence'], transaction)
	}
}
