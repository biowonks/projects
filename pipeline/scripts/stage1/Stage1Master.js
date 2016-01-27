'use strict'

// Core node libraries
let fs = require('fs'),
	path = require('path')

// 3rd-party libraries
let bunyan = require('bunyan')

// Local includes
let mutil = require('../lib/mutil')

// Glocals
let lockFile = path.resolve(__dirname, 'lock.pid')

dieIfAnotherInstanceRunning()

class Stage1Master {
	constructor(config, cluster) {
		this.config_ = config
		this.masterConfig_ = config.stage1.master

		this.cluster_ = cluster
		this.delayMs_ = 0
		this.logger_ = bunyan.createLogger({
			name: 'stage1 master',
			streams: [
				{
					level: 'info',
					stream: process.stdout
				},
				{
					level: 'error',
					path: this.masterConfig_.errFile
				}
			]
		})
		this.sequelize_ = null
		this.models_ = null

		// {$refseq_assembly_accession: #}
		this.genomeTries_ = {}

		// {$pid: $genome[name, refseq_assembly_accession]}
		this.pidToGenome_ = {}

		this.halt_ = false
	}

	halt() {
		this.halt_ = true
		this.logger_.error('User interrupted process. Disconnecting clients')
		this.cluster_.disconnect(() => {
			process.exit(2)
		})
	}

	main() {
		this.cluster_.on('exit', this.onWorkerExit.bind(this))

		this.logger_.info('Start')

		mutil.initORM(this.config_, this.logger_)
		.then((result) => {
			this.sequelize_ = result.sequelize
			this.models_ = result.models
			this.processNextGenome()
		})
		.catch((error) => {
			this.logger_.error('Unexpected error', {error: error, stack: error.stack});
		})
	}

	onWorkerExit(worker, code, signal) {
		let pid = worker.process.pid,
			genome = this.pidToGenome_[pid]

		if (signal || code !== 0) {
			this.logger_.error(`Worker failure; signal: ${signal}, code: ${code}`, genome.toJSON())
			this.increaseTries(genome.refseq_assembly_accession)
			if (this.genomeTries_[genome.refseq_assembly_accession] >= this.masterConfig_.maxTriesPerGenome)
				this.logger_.info('Too many failures for genome: ' + genome.name, genome.toJSON())
		}
		else {
			// Worker exited without error
			this.logger_.info(`Worker exited cleanly`, genome.toJSON())
		}

		delete this.pidToGenome_[pid]

		this.processNextGenome()
	}

	increaseTries(refseqAssemblyAccession) {
		if (!this.genomeTries_[refseqAssemblyAccession])
			this.genomeTries_[refseqAssemblyAccession] = 1
		else
			this.genomeTries_[refseqAssemblyAccession]++
	}

	processNextGenome() {
		if (this.halt_ || this.numberOfActiveWorkers() === this.masterConfig_.numWorkers)
			return

		// Start one worker at a time - this avoids hitting the database
		// too many times unnecessarily.
		setTimeout(() => {
			this.nextQueuedGenome()
			.then((genome) => {
				if (genome)
					this.startWorker(genome)
			})
		}, this.delayMs_)
	}

	numberOfActiveWorkers() {
		return Object.keys(this.cluster_.workers).length
	}

	nextQueuedGenome() {
		let excludedAccessions = this.excludedRefSeqAccessions(),
			where = null
		if (excludedAccessions.length) {
			where = {
				refseq_assembly_accession: {
					$notIn: excludedAccessions
				}
			};
		}

		return this.models_.GenomeQueue.findOne({
			where: where,
			attributes: ['refseq_assembly_accession', 'name']
		})
	}

	excludedRefSeqAccessions() {
		let accessions = []
		for (let accession in this.genomeTries_)
			if (this.genomeTries_[accession] >= this.masterConfig_.maxTriesPerGenome)
				accessions.push(accession)
		for (let pid in this.pidToGenome_)
			accessions.push(this.pidToGenome_[pid].refseq_assembly_accession)
		return accessions
	}

	startWorker(genome) {
		let raa = genome.refseq_assembly_accession
		this.logger_.info('Launching worker for RefSeq accession: ' + raa, genome.toJSON())
		let worker = this.cluster_.fork()
		this.pidToGenome_[worker.process.pid] = genome
		worker.on('message', (message) => {
			this.onWorkerMessage(worker, message)
		});
	}

	onWorkerMessage(worker, message) {
		let raa = this.pidToGenome_[worker.process.pid].refseq_assembly_accession
		if (message === 'ready') {
			this.delayMs_ = this.masterConfig_.interSlaveDelayMs
			worker.send(`process ${raa}`)
			this.processNextGenome()
		}
		else if (message === 'done') {
			this.logger_.info('Worker done for RefSeq accession: ' + raa, {refseq_assembly_accession: raa})
		}
		else if (message === 'error db') {
			this.cluster_.disconnect(() => {
				this.logger_.error('\nFATAL: Database initialization error. Please check the logs and restart the application');
				process.exit(2)
			})
			return
		}
	}
}

function dieIfAnotherInstanceRunning() {
	if (fs.existsSync(lockFile)) {
		console.error(`Stage 1 is already running. If this is an error, remove ${lockFile} and re-run this script`)
		process.exit(1)
	}

	createLockFile()
}

function createLockFile() {
	fs.writeFileSync(lockFile, process.pid)
}

function removeLockFile() {
	try {
		fs.unlinkSync(lockFile)
	}
	catch (error) {}
}

process.on('exit', () => {
	removeLockFile()
})

module.exports = Stage1Master
