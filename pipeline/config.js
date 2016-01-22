'use strict';

// Core node libraries
let path = require('path');

// 3rd-party libraries
let moment = require('moment')

// Local includes
let globalConfig = require('../config')

module.exports = {
	paths: {
		root: __dirname,
		tmp: path.resolve(__dirname, 'tmp'),
		data: path.resolve(__dirname, 'data'),
		genomes: path.resolve(__dirname, 'data', 'genomes'),
		scripts: path.resolve(__dirname, 'scripts'),
		lib: path.resolve(__dirname, 'lib'),
		logs: path.resolve(__dirname, 'logs')
	},

	ncbi: {
		ftp: {
			assemblySummaryLinks: [
				{
					url: 'ftp://ftp.ncbi.nih.gov/genomes/refseq/archaea/assembly_summary.txt',
					filename: 'archaea-assembly-summary.tsv'
				},
				{
					url: 'ftp://ftp.ncbi.nih.gov/genomes/refseq/bacteria/assembly_summary.txt',
					filename: 'bacteria-assembly-summary.tsv'
				}
			]
		}
	},

	database: globalConfig.database,
	migrations: globalConfig.migrations,

	// ----------------------------------------------------
	// Specific tool configuration
	enqueuer: {
		logging: {
			errFile: path.resolve(__dirname, 'logs', 'enqueuer.err')
		},
		summaryDuration: moment.duration(1, 'day')
	}
}
