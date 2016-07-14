/* eslint-disable no-unused-expressions, global-require */

'use strict'

// Local
const AseqsService = require('./index')

describe('services', function() {
	describe('AseqsService', function() {
		describe('tools (static method)', function() {
			it('should return an array of tool-runners', function() {
				let tools = AseqsService.tools()
				expect(tools).a('Array')
				for (let tool of tools) {
					expect(tool).a('Object')
					expect(tool.id).not.empty
					expect(tool.id).a('String')

					// Special check for the coils meta
					if (tool.id === 'coils') {
						Reflect.deleteProperty(tool, 'id')

						let coilsToolRunner = require('./tool-runners/coils.tool-runner.js')
						expect(tool).deep.equal(coilsToolRunner.meta)

						tool.id = 'coils'
					}
				}
			})
		})
	})
})
