/* eslint-disable no-magic-numbers, no-new */

'use strict'

// Core
const fs = require('fs')
const path = require('path')

// Local
const ecf1Stream = require('./ecf-stream')

describe('streams', function() {
  describe('ecf stream', function() {
    it('streaming prediction of ecfs', function(done) {
			// eslint-disable-next-line no-mixed-requires
			const hmmDatabaseFile = path.resolve(__dirname, 'test-data', 'hmmer2-ecfs.hmm')
			const fastaFile = path.resolve(__dirname, 'test-data', 'hmmpfam-seqs.faa')
			const numHmmsInECFs = 45
			const numCpus = 0

			const inStream = fs.createReadStream(fastaFile)
			const hmmpfam = ecf1Stream(hmmDatabaseFile, numHmmsInECFs, numCpus)
			const results = []

			inStream
			.on('error', done)
			.pipe(hmmpfam)
			.on('error', done)
			.on('data', (result) => {
				results.push(result)
			})
			.on('finish', () => {
				expect(results).eql([
					{
						ecfs: [],
						queryName: '1383873',
					},
					{
						ecfs: [
							{
								name: 'ECF_999',
								ali_from: 91,
								ali_to: 206,
								ali_cov: '..',
								hmm_from: 1,
								hmm_to: 140,
								hmm_cov: '[]',
								score: 3.9,
								evalue: 2.8,
							},
						],
						queryName: '1384778',
					},
					{
						ecfs: [],
						queryName: '1385505',
					},
					{
						ecfs: [
							{
								name: 'ECF_2',
								ali_from: 6,
								ali_to: 191,
								ali_cov: '.]',
								hmm_from: 1,
								hmm_to: 188,
								hmm_cov: '[]',
								score: 463.3,
								evalue: 1.5e-138,
							},
							{
								name: 'ECF_1',
								ali_from: 7,
								ali_to: 190,
								ali_cov: '..',
								hmm_from: 1,
								hmm_to: 204,
								hmm_cov: '[]',
								score: 202.2,
								evalue: 5.9e-60,
							},
							{
								name: 'ECF_999',
								ali_from: 29,
								ali_to: 189,
								ali_cov: '..',
								hmm_from: 1,
								hmm_to: 140,
								hmm_cov: '[]',
								score: 137.5,
								evalue: 1.8e-40,
							},
							{
								name: 'ECF_20',
								ali_from: 7,
								ali_to: 191,
								ali_cov: '.]',
								hmm_from: 1,
								hmm_to: 191,
								hmm_cov: '[]',
								score: 128.2,
								evalue: 1.2e-37,
							},
							{
								name: 'ECF_30',
								ali_from: 13,
								ali_to: 187,
								ali_cov: '..',
								hmm_from: 1,
								hmm_to: 170,
								hmm_cov: '[]',
								score: 119.1,
								evalue: 6.4e-35,
							},
							{
								name: 'ECF_10',
								ali_from: 10,
								ali_to: 188,
								ali_cov: '..',
								hmm_from: 1,
								hmm_to: 189,
								hmm_cov: '[]',
								score: 47.6,
								evalue: 2e-13,
							},
						],
						queryName: '1386174',
					},
				])
				done()
			})
		})
	})
})
