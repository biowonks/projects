'use strict'

// Core
let path = require('path')

// Vendor
let moment = require('moment')

// Local
let packageJSON = require('../package.json'), // eslint-disable-line no-mixed-requires
	database = require('../src/node_modules/mist-lib/db/config')(packageJSON.name)

// --------------------------------------------------------
// database.name = ''
// database.user = ''
// database.password = ''
// database.sequelizeOptions.host = 'db'
// database.migrations.path = path.resolve(__dirname, '..', 'src', 'node_modules', 'mist-lib', 'db', 'migrations')

let pipelineRootPath = path.resolve(__dirname, '..'),
	paths = {
		root: pipelineRootPath,
		data: path.resolve(pipelineRootPath, 'data'),
		genomes: path.resolve(pipelineRootPath, 'data', 'genomes'),
		// scripts: path.resolve(pipelineRootPath, 'scripts'),
		// lib: path.resolve(pipelineRootPath, 'scripts', 'lib'),
		vendor: path.resolve(pipelineRootPath, 'vendor')
	}

module.exports = {
	paths,

	database,

	ncbi: {
		ftp: {
			genomeDataRootUrl: 'ftp://ftp.ncbi.nlm.nih.gov/genomes/all'
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
			version: '30.0',
			basePath: path.resolve(paths.vendor, 'pfam', '30.0')
		}
	},

	toolRunners: {
		coils: {
			ticksPerProgressEvent: 25000
		},
		segs: {
			ticksPerProgressEvent: 25000
		},
		pfam30: {
			databasePath: path.resolve(paths.vendor, 'pfam', '30.0', 'Pfam-A.hmm'),
			ticksPerProgressEvent: 100
		}
	},

	// ----------------------------------------------------
	// Specific module configuration
	seedNewGenomes: {
		summaryFileDuration: moment.duration(1, 'day'),
		maxNewGenomesPerRun: 5,
		assemblySummaryLinks: [
			{
				url: 'ftp://ftp.ncbi.nih.gov/genomes/refseq/archaea/assembly_summary.txt',
				fileName: 'archaea-assembly-summary.tsv'
			},
			{
				url: 'ftp://ftp.ncbi.nih.gov/genomes/refseq/bacteria/assembly_summary.txt',
				fileName: 'bacteria-assembly-summary.tsv'
			}
		]
	}
}
