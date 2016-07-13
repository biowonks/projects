'use strict'

// Local
const AbstractSeqsService = require('./AbstractSeqsService')

module.exports =
class AseqsService extends AbstractSeqsService {
	insertIgnoreSeqs(seqs, transaction) {
		return super.insertIgnoreSeqs(seqs, ['id', 'length', 'sequence'], transaction)
	}

	fetchPrecomputedData(aseqs, toolIds) {

	}

	compute(aseqs, toolIds) {

	}

	upsert(aseqs, toolIds) {

	}

	groupByUndoneTools(aseqs, toolIds) {

	}
}
