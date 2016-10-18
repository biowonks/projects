#!/usr/bin/env node

/**
 * Usage: merge-junit-reports.js [<test-results.xml> ...]
 *
 *  Merges junit xml reports into a single xml result file.
 */

/* eslint-disable no-console */
'use strict'

// Core
const fs = require('fs')

// Vendor
const junitReportMerger = require('junit-report-merger')

let sourceFiles = process.argv.slice(2), // eslint-disable-line no-magic-numbers
	sourceStreams = sourceFiles.map((sourceFile) => fs.createReadStream(sourceFile))

junitReportMerger.mergeStreams(process.stdout, sourceStreams)
