'use strict'

// Core
const path = require('path')

// Vendor
const moment = require('moment')

// Local
const database = require('../src/node_modules/mist-lib/db/config')

// --------------------------------------------------------
let vendorPath = path.resolve(__dirname, '..', 'vendor')

module.exports = {
	paths: {
		vendor: vendorPath
	},

	database,

	ncbi: {
		ftp: {
			genomeDataRootUrl: 'ftp://ftp.ncbi.nlm.nih.gov/genomes/all'
		}
	},

	vendor: {
		// Vendor tools
		coils: {
			basePath: path.resolve(vendorPath, 'vendor-tools', 'coils')
		},
		seg: {
			basePath: path.resolve(vendorPath, 'vendor-tools', 'seg')
		},

		// Other tools
		hmmer3: {
			version: '3.1b2',
			basePath: path.resolve(vendorPath, 'hmmer3', '3.1b2'),
			binPath: path.resolve(vendorPath, 'hmmer3', '3.1b2', 'bin')
		},

		// Databases
		agfam: {
			version: '2.0',
			basePath: path.resolve(vendorPath, 'agfam', '2.0')
		},
		pfam: {
			version: '30.0',
			basePath: path.resolve(vendorPath, 'pfam', '30.0')
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
			databasePath: path.resolve(vendorPath, 'pfam', '30.0', 'Pfam-A.hmm'),
			ticksPerProgressEvent: 50
		},
		agfam2: {
			databasePath: path.resolve(vendorPath, 'agfam', '2.0', 'agfam.hmm'),
			ticksPerProgressEvent: 1000
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
