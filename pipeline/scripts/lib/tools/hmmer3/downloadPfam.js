'use strict'

let fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	spawn = require('child_process').spawn,
	config = require(path.resolve(__dirname, '../../../../config.js')),
	ftp = require('ftp'),
	mutil = require(path.resolve(config.paths.lib, 'mutil'))
	
let paths = config.paths,	
	localHmmdbPath = paths.hmmdb,
	remotePfam = config.pfam,
	pfamFtp = remotePfam.ftp,
	pfamFiles = remotePfam.files,
	hmmFile = pfamFiles.hmm,
	hmmpress = path.resolve(paths.scripts, 'lib', 'tools', 'hmmer3', 'bin', 'hmmpress')

module.exports = function(optVersion, optSkipDownload, optSkipExtraction, optSkipHmmpress) {
	if (optVersion) {

		assert(typeof(optVersion) == 'string', 'Version must be a string, eg: \'Pfam29.0\'')
		assert(optVersion.match(/^Pfam[0-9]*\.[0-9]*/), 'Version input is not valid')
		validatePfamVersion(optVersion)

		let version = optVersion
		downloadPfam(version, optSkipDownload, optSkipExtraction, optSkipHmmpress)
	}
	else {
		downloadLatestPfamVersion()
	}
}

// ----------------------------------------------------------------------------

function pfamVersionData2version(data) {
	/* version file	example
	Pfam release       : 29.0
	Pfam-A families    : 16035
	Date               : 2015-10
	Based on UniProtKB : 2015_08
	*/
	let firstLine = data.split('\n')[0]
	assert(firstLine.indexOf('Pfam release') != -1, 'No version information here')
	let version = firstLine.split(':')[1].trim()
	console.log('The most recent Pfam version: ' + version + ' will be downloaded.')
	return 'Pfam' + version
}

function downloadLatestPfamVersion() {
	let remoteVersion = pfamFtp.currentReleaseDir + '/' + pfamFtp.versionFile,
		localVersionFile = paths.tmp + '/' + 'Pfam.version',
		localVersionGz = localVersionFile + '.gz'

	mutil.download(remoteVersion, localVersionGz)
	.then(() => {
		mutil.gunzip(localVersionGz)
	})
	.then(() => {
		return mutil.readFile(localVersionFile)
	})
	.then((result) => {
		let version = pfamVersionData2version(result)
		if(!version) {
			console.log('version is ' + version, '- exiting..')
			process.exit()
		}
		downloadPfam(version)
	})
	.catch((error) => {
		console.log(error)
	})
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

function fileExists(fullPath) {
	return fs.existsSync(fullPath)
}

function filesExist(files, optRoot) {
	let root = './'
	if (optRoot)
		root = optRoot
	for (let i = 0; i<files.length; i++) {
		let file = files[i]
		if(!fs.existsSync(path.resolve(root, file)))
			return false
	}
	return true
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



function downloadPfam(version, optSkipDownload, optSkipExtraction, optSkipHmmpress) {
	let pfamVersionDir = path.resolve(localHmmdbPath, version),
		remoteVersionFtp = pfamFtp.releasesDir + '/' + version


	let fullPathHmmFile = path.resolve(pfamVersionDir, hmmFile),
		hmmExists = filesExist(pfamFiles.hmmpressed, pfamVersionDir)

	if (!hmmExists || optSkipDownload || optSkipExtraction || optSkipHmmpress) {
		let remoteHmmGz = remoteVersionFtp + '/' + hmmFile + '.gz',
			localHmmGz = fullPathHmmFile + '.gz'

		if(!optSkipDownload) {
			console.log('Downloading HMM database', version, '...')
			mutil.download(remoteHmmGz, localHmmGz, true /*force mkdir*/)
				.then(() => {
					console.log('HMM database download completed.')
					runUnzipAndHmmPress(localHmmGz, fullPathHmmFile, hmmpress, optSkipExtraction, optSkipHmmpress)
				})
		}
		else {
			console.log('Downloading HMM database', version, 'skipped.')
			runUnzipAndHmmPress(localHmmGz, fullPathHmmFile, hmmpress, optSkipExtraction, optSkipHmmpress)
		}
	}
	else {
		console.log('HMM database', version, 'already exists and hmmpressed:', pfamVersionDir, pfamFiles.hmmpressed)
	}
}
