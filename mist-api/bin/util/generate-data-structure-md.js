/* eslint-disable no-console */
'use strict'

// Core
const fs = require('fs')

// Local
const MistBootService = require('../../src/node_modules/mist-lib/services/MistBootService'),
	ModelMarkdownBuilder = require('./ModelMarkdownBuilder')

let mistBootService = new MistBootService({
		logger: {
			name: 'generator',
			streams: [
				fs.createWriteStream('/dev/null')
			]
		}
	}),
	models = mistBootService.setupModels(),
	Sequelize = mistBootService.sequelize().Sequelize,
	modelMarkdownBuilder = new ModelMarkdownBuilder(Sequelize)

console.error('\n===========================================================')
console.error('Generating data structure markdown')
generateModelMarkdown()

// --------------------------------------------------------
function generateModelMarkdown() {
	console.log('# Data Structures\n')

	Object.keys(models).forEach((modelName, i) => {
		console.error(`${i + 1}. ${modelName}`)

		let model = models[modelName],
			md = modelMarkdownBuilder.markdown(model)

		console.log(md)
	})
}
