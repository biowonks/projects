#!/usr/bin/env node

'use strict'

// Core
let readline = require('readline')

// Vendor
let program = require('commander')

// Local
let MistBootService = require('../services/MistBootService')

// --------------------------------------------------------
// --------------------------------------------------------
program
.description('Reverts the last exectued migration')
.option('-n, --num-to-undo <integer>', 'Number of migrations to undo', parseInt)
.option('-y, --yes', 'Automatic yes to prompt (run non-interactively)')
.parse(process.argv)

let numberToUndo = program.numToUndo ? Number(program.numToUndo) : 1
if (!/^[1-9]\d*$/.test(numberToUndo)) {
	// eslint-disable-next-line no-console
	console.error('FATAL: invalid value for -n, --num-to-undo option; must be a positive integer')
	process.exit(1)
}

if (program.yes)
	undoMigration()
else
	confirmUndo()

// --------------------------------------------------------
// --------------------------------------------------------
function confirmUndo() {
	let rl = readline.createInterface({
		input: process.stdin,
		output: process.stderr // Pipe to stdout to mitigate bunyan parsing issues
	})

	rl.question('This action may be result in data loss.\n\n' +
		'Are you sure you want to undo the last migration? [y/N] ', (answer) => {
		rl.close()

		if (answer !== 'y')
			process.exit()

		undoMigration()
	})
}

function undoMigration() {
	let bootService = new MistBootService({
		applicationName: 'undo-migration',
		logger: {
			name: 'undo-migration'
		}
	})

	bootService.setupSequelize()
	bootService.setupMigrator()
	bootService.checkDatabaseConnection()
	.then(() => bootService.migrator().down(numberToUndo))
	.finally(() => bootService.sequelize().close())
}
