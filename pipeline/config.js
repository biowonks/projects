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
		lib: path.resolve(__dirname, 'scripts', 'lib'),
		logs: path.resolve(__dirname, 'logs'),
		vendor: path.resolve(__dirname, 'vendor'),
		hmmdb: path.resolve(__dirname, 'vendor', 'hmmdb'),
		vendorTools: path.resolve(__dirname, 'vendor', 'tools')
	},

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

	pfam: {
		ftp: {
			root: 'ftp.ebi.ac.uk',
			currentReleaseDir: 'ftp://ftp.ebi.ac.uk/pub/databases/Pfam/current_release',
			releasesDir: 'ftp://ftp.ebi.ac.uk/pub/databases/Pfam/releases',
			versionFile: 'Pfam.version.gz'
		},
		files: {
			hmm: 'Pfam-A.hmm',
			hmmDat: 'Pfam-A.hmm.dat',
			hmmGzip: 'Pfam-A.hmm.gz',
			hmmDatGzip: 'Pfam-A.hmm.dat.gz',
			hmmpressed: ['Pfam-A.hmm', 'Pfam-A.hmm.h3f', 'Pfam-A.hmm.h3i', 'Pfam-A.hmm.h3m', 'Pfam-A.hmm.h3p']
		}
	},

	hmmer: {
		ftp: {
			'3.1': 'http://eddylab.org/software/hmmer3/3.1b2/hmmer-3.1b2-linux-intel-x86_64.tar.gz'
		},
		local: {
			'3.1': 'hmmer3.1'
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
