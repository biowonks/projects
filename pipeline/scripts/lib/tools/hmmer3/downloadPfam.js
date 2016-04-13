'use strict'

let fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	shell = require('shelljs'),
	spawn = require('child_process').spawn,
	config = require(path.resolve(__dirname, '../../../../config.js')),
	ftp = require('ftp'),
	mutil = require(path.resolve(config.paths.lib, 'mutil'))
	
let paths = config.paths,	
	localPfamPath = path.resolve(paths.db, 'pfam'),
	remotePfam = config.pfam,
	pfamFtp = remotePfam.ftp,
	pfamFiles = remotePfam.files,
	hmmFile = pfamFiles.hmm,
	hmmpress = path.resolve(paths.scripts, 'lib', 'tools', 'hmmer3', 'bin', 'hmmpress')

module.exports = function(optVersion, optSkipDownload, optSkipExtraction, optSkipHmmpress) {
	if (optVersion) {

		assert(typeof(optVersion) == 'string', 'Version must be a string, eg: \'Pfam29.0\'')
		assert(optVersion.match(/^[0-9]*\.[0-9]*/), 'Version input is not valid')
		validatePfamVersion(optVersion)

		let version = optVersion
		// createNecessaryDirs([paths.db, localPfamPath, path.resolve(localPfamPath, optVersion)])
		downloadPfam(version, optSkipDownload, optSkipExtraction, optSkipHmmpress)
	}
	else {
		downloadLatestPfamVersion()
	}
}

// ----------------------------------------------------------------------------

function downloadLatestPfamVersion() {
	let version = undefined
	let remoteVersion = pfamFtp.currentReleaseDir + '/' + pfamFtp.versionFile,
		localVersionFile = paths.tmp + '/' + 'Pfam.version',
		localVersionGz = localVersionFile + '.gz'

	mutil.download(remoteVersion, localVersionGz)
	mutil.gunzip(localVersionGz)
		.then((result) => {
			/* version file	example
			Pfam release       : 29.0
			Pfam-A families    : 16035
			Date               : 2015-10
			Based on UniProtKB : 2015_08
			*/
			fs.readFile(localVersionFile, 'utf8', (err, data) => {
				if (err)
					throw err
				let firstLine = data.split('\n')[0]
				assert(firstLine.indexOf('Pfam release') != -1, 'No version information here')
				version = firstLine.split(':')[1].trim()
				console.log('The most recent Pfam version: ' + version + ' will be downloaded.')
				downloadPfam(version)
			})
		})
	return version
}

function validatePfamVersion(version) { 
	let client = new ftp(),
		remoteDir = '/pub/databases/Pfam/releases/Pfam' + version

	client.on('ready', function() {
		client.list(remoteDir, function(err, list) {
			if (err) {
				console.log('given version ' + version + ' does not exist at ' + remoteDir + '!')
				throw err
			}
			client.end()
		})
	})
	client.connect({'host':pfamFtp.root})
}

function createDir(fullPath) {
	fs.access(fullPath, fs.F_OK, function(err) {
		if (err) {
			shell.mkdir('-p', fullPath)
		}
	})
}

function fileExists(fullPath) {
	return fs.existsSync(fullPath)
}

function runHmmpress(hmmpress, dbPath, optSkipHmmpress) {
	if(!optSkipHmmpress) {
		console.log('hmmpress is running...')
		let hmmpressChild = spawn(hmmpress, [dbPath])
		hmmpressChild.stdout.on('data', function(data) {})
		hmmpressChild.stderr.on('data', function(data) {})
		hmmpressChild.on('close', function(code) {
				if(code) {
					console.log('hmmpress failed!')
					console.log('hmmpress binary should be at: ' + hmmpress)
					console.log('local hmm database should be at: ' + fullPathHmmFile)
					console.log('hmmpress could have been applied before, check *.h3f *.h3i *.h3m *.h3p files')
				}
				else {
					let status = optSkipHmmpress ? 'skipped' : 'completed'
					console.log('hmmpress is completed ' + status)
				}
		})
	}
	else {
		console.log('hmmpress skipped.')
	}
}

function runUnzipAndHmmPress(localHmmGz, fullPathHmmFile, hmmpress, optSkipExtraction, optSkipHmmpress) {
	if(!optSkipExtraction) {
		console.log('Unzipping...')
		mutil.gunzip(localHmmGz, fullPathHmmFile)
			.then((result) => {
				console.log('Unzipping completed.')
				runHmmpress(hmmpress, fullPathHmmFile, optSkipHmmpress)
			})
	}
	else {
		console.log('Unzipping skipped.')
		runHmmpress(hmmpress, fullPathHmmFile, optSkipHmmpress)
	}
}

function createNecessaryDirs(dirList) {
	for (let i = 0; i < dirList.length; i++) {
		console.log(dirList[i])
		createDir(dirList[i])
	}
}

function downloadPfam(version, optSkipDownload, optSkipExtraction, optSkipHmmpress) {
	let pfamVersionDir = path.resolve(localPfamPath, version),
		remoteVersionFtp = pfamFtp.releasesDir + '/' + 'Pfam' + version


	let fullPathHmmFile = path.resolve(pfamVersionDir, hmmFile),
		hmmExists = fileExists(fullPathHmmFile)

	if (!hmmExists || optSkipDownload || optSkipExtraction || optSkipHmmpress) {
		let remoteHmmGz = remoteVersionFtp + '/' + hmmFile + '.gz',
			localHmmGz = fullPathHmmFile + '.gz'

		if(!optSkipDownload) {
			console.log('Downloading HMM database...')
			mutil.download(remoteHmmGz, localHmmGz, true /*force mkdir*/)
				.then(() => {
					console.log('Downloading HMM database completed.')
					runUnzipAndHmmPress(localHmmGz, fullPathHmmFile, hmmpress, optSkipExtraction, optSkipHmmpress)
				})
		}
		else {
			console.log('Downloading HMM database skipped.')
			runUnzipAndHmmPress(localHmmGz, fullPathHmmFile, hmmpress, optSkipExtraction, optSkipHmmpress)
		}
	}
	else {
		console.log('HMM database already exists: ' + fullPathHmmFile)
	}
}
