'use strict'

// Core
const path = require('path')

// Vendor
const loadConfig = require('node-config-loader')
const moment = require('moment')

// Local
const database = require('../src/node_modules/mist-lib/db/config')

// --------------------------------------------------------
const vendorPath = path.resolve(__dirname, '..', 'vendor')

const config = {
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

		hmmer2: {
			version: '2.4i',
			basePath: path.resolve(vendorPath, 'hmmer2', '2.4i'),
			binPath: path.resolve(vendorPath, 'hmmer2', '2.4i', 'bin')
		},

		// Proprietary
		tmhmm2: {
			// TMHMM2 is a proprietary tool without a public distribution. Therefore, to enable
			// this tool, provide a value for the secureUrl variable which is accessible to you.
			// Do not set this value here, but rather define it in the "local" directory beneath
			// this directory (that is not committed to the repository).
			secureUrl: null,
			basePath: path.resolve(vendorPath, 'tmhmm2'),
			libPath: path.resolve(vendorPath, 'tmhmm2', 'lib'),
			binPath: path.resolve(vendorPath, 'tmhmm2', 'bin')
		},

		// Databases
		agfam: {
			version: '2.0',
			basePath: path.resolve(vendorPath, 'agfam', '2.0')
		},
		ecf: {
			version: '1.0',
			basePath: path.resolve(vendorPath, 'ecf', '1.0')
		},
		pfam: {
			version: '31.0',
			basePath: path.resolve(vendorPath, 'pfam', '31.0')
		}
	},

	toolRunners: {
		coils: {
			ticksPerProgressEvent: 25000
		},
		segs: {
			ticksPerProgressEvent: 25000
		},
		pfam31: {
			databasePath: path.resolve(vendorPath, 'pfam', '31.0', 'Pfam-A.hmm'),
			ticksPerProgressEvent: 50
		},
		agfam2: {
			databasePath: path.resolve(vendorPath, 'agfam', '2.0', 'agfam.hmm'),
			ticksPerProgressEvent: 1000
		},
		tmhmm2: {
			ticksPerProgressEvent: 250
		},
		ecf1: {
			databasePath: path.resolve(vendorPath, 'ecf', '1.0', 'ecfs.bin'),
			ticksPerProgressEvent: 250
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

if (config.vendor.tmhmm2.secureUrl)
	throw new Error('TMHMM2 is a proprietary tool; please set this value in local configuration that is not part of the source repository!')

loadConfig(__dirname, config)

module.exports = config
