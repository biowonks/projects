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
			let delayMillis = aseqs.length * 5
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
			let progressEvents = []
			beforeEach(() => {
				progressEvents.length = 0
			})

			function createMockToolRunner(ticksPerProgressEvent) {
				let x = new MockToolRunner(ticksPerProgressEvent)
				x.on('progress', (e) => progressEvents.push(e))
				return x
			}

			it('empty array resolves to empty result array', function() {
				let x = new MockToolRunner(),
					input = []
				return x.run(input)
				.then((result) => {
					expect(result).equal(input)
				})
			})

			it('does not emit final progress event for empty array if ticksPerProgressEvent is non-zero', function() {
				let x = createMockToolRunner(),
					input = []

				return x.run(input)
				.then(() => {
					expect(progressEvents).eql([])
				})
			})

			it('1 aseq, ticksPerProgressEvent: 1, only emits final progress event', function() {
				let x = createMockToolRunner(1),
					input = ['aseq']

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
				let x = createMockToolRunner(2),
					input = ['aseq']

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
				let x = createMockToolRunner(1),
					input = ['aseq', 'aseq']

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
