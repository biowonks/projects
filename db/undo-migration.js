#!/usr/bin/env node

'use strict'

// Core
let readline = require('readline')

// Vendor
let program = require('commander')

// Local
let BootStrapper = require('../services/BootStrapper')

// --------------------------------------------------------
// --------------------------------------------------------
program
.description('Reverts the last exectued migration')
.option('-y, --yes', 'Automatic yes to prompt (run non-interactively)')
.parse(process.argv)

if (program.yes)
	undoLastMigration()
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
			process.exit(0)

		undoLastMigration()
	})
}

function undoLastMigration() {
	let bootStrapper = new BootStrapper({
		logger: {
			name: 'undo-migration'
		}
	})

	bootStrapper.setupSequelize()
	bootStrapper.checkDatabaseConnection()
	.then(() => {
		return bootStrapper.setupDatabase()
	})
	.then(() => {
		return bootStrapper.migrator().down()
	})
}
