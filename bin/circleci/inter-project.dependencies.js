'use strict'

module.exports = [
	{
		name: 'core-lib',
		dependencies: []
	},
	{
		name: 'seqdepot-lib',
		dependencies: [
			'core-lib'
		]
	},
	{
		name: 'mist-lib',
		dependencies: [
			'core-lib',
			'seqdepot-lib'
		]
	},
	{
		name: 'mist-api',
		dependencies: [
			'mist-lib'
		]
	},
	{
		name: 'mist-pipeline',
		dependencies: [
			'core-lib',
			'seqdepot-lib',
			'mist-lib'
		]
	}
]
