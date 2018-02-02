/* eslint-disable no-magic-numbers */

'use strict'

// Local
const AbstractToolRunner = require('./AbstractToolRunner')

class MockToolRunner extends AbstractToolRunner {
	constructor(ticksPerProgressEvent = 0) {
		super({ticksPerProgressEvent})
	}

	onRun_(aseqs) {
		return new Promise((resolve, reject) => {
			const delayMillis = aseqs.length * 5
			setTimeout(() => {
				for (let i = 0; i < aseqs.length; i++)
					this.tick_()
				resolve(aseqs)
			}, delayMillis)
		})
	}
}

MockToolRunner.meta = {
	id: 'mock-tool'
}

describe('services', function() {
	describe('AseqsService', function() {
		describe('AbstractToolRunner', function() {
			it('empty array resolves to empty result array', function() {
				const x = new MockToolRunner()
				return x.run([])
				.then((result) => {
					expect(result).eql([])
				})
			})

			it('does not emit final progress event for empty array if ticksPerProgressEvent is non-zero', function() {
				const x = new MockToolRunner()
				const input = []
				const progressEvents = []
				x.on('progress', (e) => progressEvents.push(e))

				return x.run(input)
				.then(() => {
					expect(progressEvents).eql([])
				})
			})

			it('1 aseq, ticksPerProgressEvent: 1, only emits final progress event', function() {
				const x = new MockToolRunner(1)
				const input = ['aseq']
				const progressEvents = []
				x.on('progress', (e) => progressEvents.push(e))

				return x.run(input)
				.then(() => {
					expect(progressEvents.length).equal(1)
					let e = progressEvents.shift()
					expect(e.toolId).equal(MockToolRunner.meta.id)
					expect(e.completed).equal(1)
					expect(e.total).equal(1)
					expect(e.percent).equal(100.)
					expect(e.averagePerSecond).above(0)
				})
			})

			it('1 aseq, ticksPerProgressEvent: 2, only emits final progress event', function() {
				const x = new MockToolRunner(2)
				const input = ['aseq']
				const progressEvents = []
				x.on('progress', (e) => progressEvents.push(e))

				return x.run(input)
				.then(() => {
					expect(progressEvents.length).equal(1)
					let e = progressEvents.shift()
					expect(e.toolId).equal(MockToolRunner.meta.id)
					expect(e.completed).equal(1)
					expect(e.total).equal(1)
					expect(e.percent).equal(100.)
					expect(e.averagePerSecond).above(0)
				})
			})

			it('2 aseqs, ticksPerProgressEvent: 1, emits 2 progress events', function() {
				const x = new MockToolRunner(1)
				const input = ['aseq', 'aseq']
				const progressEvents = []
				x.on('progress', (e) => progressEvents.push(e))

				return x.run(input)
				.then(() => {
					expect(progressEvents.length).equal(2)
					let e1 = progressEvents.shift()
					expect(e1.toolId).equal(MockToolRunner.meta.id)
					expect(e1.completed).equal(1)
					expect(e1.total).equal(2)
					expect(e1.percent).equal(50.)
					expect(e1.averagePerSecond).above(0)

					let e2 = progressEvents.shift()
					expect(e2.toolId).equal(MockToolRunner.meta.id)
					expect(e2.completed).equal(2)
					expect(e2.total).equal(2)
					expect(e2.percent).equal(100.)
					expect(e2.averagePerSecond).above(0)
				})
			})
		})
	})
})
