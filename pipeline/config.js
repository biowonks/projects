'use strict';

// Core node libraries
let path = require('path');

// 3rd-party libraries
let moment = require('moment')

// Local includes
let globalConfig = require('../config')

let paths = {
	root: __dirname,
	tmp: path.resolve(__dirname, 'tmp'),
	data: path.resolve(__dirname, 'data'),
	genomes: path.resolve(__dirname, 'data', 'genomes'),
	scripts: path.resolve(__dirname, 'scripts'),
	lib: path.resolve(__dirname, 'scripts', 'lib'),
	logs: path.resolve(__dirname, 'logs'),
	vendor: path.resolve(__dirname, 'vendor')
}

module.exports = {
	paths,

	ncbi: {
		ftp: {
			genomeDataRootUrl: 'ftp://ftp.ncbi.nlm.nih.gov/genomes/all',
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

	vendor: {
		// Tools
		coils: {
			basePath: path.resolve(paths.vendor, 'coils')
		},
		hmmer3: {
			version: '3.1b2',
			basePath: path.resolve(paths.vendor, 'hmmer3', '3.1b2'),
			binPath: path.resolve(paths.vendor, 'hmmer3', '3.1b2', 'bin')
		},
		seg: {
			basePath: path.resolve(paths.vendor, 'seg')
		},

		// Databases
		agfam: {
			version: '2.0',
			basePath: path.resolve(paths.vendor, 'agfam', '2.0')
		},
		pfam: {
			version: '29.0',
			basePath: path.resolve(paths.vendor, 'pfam', '29.0')
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
		summaryDuration: moment.duration(1, 'day'),
		maxNewGenomesToQueuePerRun: 5
	},

	stage1: {
		// Logging is all done to stdout
		master: {
			numWorkers: 1,
			// Amount to delay when kicking off parallel slaves
			interSlaveDelayMs: 1000,
			maxTriesPerGenome: 2
		}
	}
}
