'use strict'

// Core
const assert = require('assert')

// Local
const PerGenomePipelineModule = require('../PerGenomePipelineModule'),
	AseqsService = require('../../../services/AseqsService'),
	AseqModelFn = require('../../../models/Aseq.model.js')

// Other
const kAseqModelToolIdSet = new Set(AseqModelFn.kToolIdFieldNames),
	kSupportedTools = AseqsService.tools().filter((x) => kAseqModelToolIdSet.has(x.id)),
	kSupportedSubModuleMap = new Map(kSupportedTools.map((x) => [x.id, x.description]))

module.exports =
class AseqCompute extends PerGenomePipelineModule {
	static description() {
		return 'run one or more tools and persist the results'
	}

	static subModuleMap() {
		return kSupportedSubModuleMap
	}

	static dependencies() {
		return ['NCBICoreData']
	}

	/**
	 * The AseqCompute module computes the results for one or more ${toolIds} for the Aseqs
	 * contained in ${genome}.
	 *
	 * @param {Object} app
	 * @param {Genome} genome
	 * @param {Array.<String>} toolIds - list of tool ids to compute
	 */
	constructor(app, genome, toolIds) {
		super(app, genome)
		this.toolIds_ = toolIds
		this.aseqsService_ = new AseqsService(this.models_.Aseq)
	}

	optimize() {
		return this.analyze(this.models_.Aseq.getTableName())
	}

	undo() {
		this.logger_.info('Aseq computations are preserved regardless of undo. Skipping operation')
	}

	run() {
		return this.aseqsMissingData_(this.toolIds_)
		.then((aseqs) => {
			this.logger_.info(`Found ${aseqs.length} aseqs missing data for one of ${this.toolIds_.join(', ')}`)
			this.shutdownCheck_()
			let groups = this.aseqsService_.groupByUndoneTools(aseqs, this.toolIds_)
			return this.computeGroups_(groups)
			.then(() => this.saveGroups_(groups))
		})
	}

	/**
	 * @returns {Array.<Object>} - an array of worker module records, one for each tool id provided to the constructor
	 */
	workerModuleRecords() {
		return this.toolIds_.map((toolId) => {
			let data = super.newWorkerModuleData()
			data.module += ':' + toolId
			return data
		})
	}

	// ----------------------------------------------------
	// Private methods
	/**
	 * Rather than pull down all derived data for each aseq, this method simply returns 1 for those
	 * tool fields that have data or null otherwise. This module's purpose is simply to compute the
	 * undone tool data. Thus, it is not necessary to fetch the actual precomputed data for each
	 * tool that has already been completed.
	 *
	 * @param {Array.<String>} toolIds
	 * @param {Transaction} [optTransaction]
	 * @returns {Array.<Aseq>} - array of all Aseqs for this genome that have at least one undone tool of ${toolIds}
	 */
	aseqsMissingData_(toolIds, optTransaction) {
		assert(toolIds && Array.isArray(toolIds) && toolIds.length > 0)

		let {Component, Gene, Aseq} = this.models_,
			toolSelectFields = toolIds.map((x) => `case when ${x} is not null then 1 else null end`)
				.join(', '),
			anyToolNullClause = toolIds.map((x) => x + ' is null').join(' OR '),
			sql = `
SELECT c.id, c.sequence, ${toolSelectFields}
FROM ${Component.getTableName()} a JOIN ${Gene.getTableName()} b ON (a.id = b.component_id)
	JOIN ${Aseq.getTableName()} c ON (b.aseq_id = c.id)
WHERE a.genome_id = ? AND b.aseq_id is not null and (${anyToolNullClause})
ORDER BY b.id`

		return this.sequelize_.query(sql, {
			model: this.models_.Aseq,
			replacements: [this.genome_.id],
			transaction: optTransaction
		})
	}

	/**
	 * Each group is an object containing an array of aseqs and an array of toolIds to run on the
	 * given aseqs. This method iterates over each group and computes the results of each of the
	 * specified toolIds.
	 *
	 * @param {Array.<Object>} groups
	 * @returns {Promise}
	 */
	computeGroups_(groups) {
		return Promise.each(groups, (group) => {
			this.logger_.info({
				numAseqs: group.aseqs.length,
				toolIds: group.toolIds
			}, `Computing ${group.toolIds.join(', ')} for ${group.aseqs.length} aseqs`)
			return this.aseqsService_.compute(group.aseqs, group.toolIds)
			.then(() => {
				this.shutdownCheck_()
			})
		})
	}

	/**
	 * Persists each of the results for each group of tool results.
	 *
	 * @param {Array.<Object>} groups
	 * @returns {Promise}
	 */
	saveGroups_(groups) {
		return this.sequelize_.transaction({
			isolationLevel: 'READ COMMITTED'
		}, (transaction) => {
			return Promise.each(groups, (group) => {
				this.logger_.info({
					numAseqs: group.aseqs.length,
					toolIds: group.toolIds
				}, `Saving ${group.toolIds.join(', ')} results for ${group.aseqs.length} aseqs`)
				return this.aseqsService_.saveToolData(group.aseqs, group.toolIds, transaction)
			})
		})
	}
}
