#!/usr/bin/env node

/* eslint-disable no-console */
'use strict'

// Core
const fs = require('fs')

// Vendor
const junitReportMerger = require('junit-report-merger')

// Other
const kUsage = `Usage: merge-junit-reports.js <test-results.xml> [<test-results.xml> ...]

  Merges junit xml reports into a single xml result file.
`

let sourceFiles = process.argv.slice(2) // eslint-disable-line no-magic-numbers
if (!sourceFiles.length) {
	console.error(kUsage)
	process.exit(1)
}

let sourceStreams = sourceFiles.map((sourceFile) => fs.createReadStream(sourceFile))

junitReportMerger.mergeStreams(process.stdout, sourceStreams)
