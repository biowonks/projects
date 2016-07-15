'use strict'

// Core
const assert = require('assert')

// Local
const PerGenomePipelineModule = require('../PerGenomePipelineModule'),
	AseqsService = require('../../../services/AseqsService'),
	AseqModelFn = require('../../../models/Aseq.model.js'),
	arrayUtil = require('../../lib/array-util')

module.exports =
class Compute extends PerGenomePipelineModule {
	/**
	 * @returns {Object} - enumerated information on how to call this module via the pipeline entrypoint. Supported tools include those with fields defined in the Aseq model class and that have a corresponding tool runner.
	 */
	static cli() {
		let aseqModelToolIdSet = new Set(AseqModelFn.kToolIdFieldNames),
			supportedTools = AseqsService.tools().filter((x) => aseqModelToolIdSet.has(x.id)),
			supportedToolIdSet = new Set(supportedTools.map((x) => x.id))

		return {
			description: 'run one or more tools and store the results',
			usage: '<toolId>[+...]',
			moreInfo: 'Supported tools include:\n\n' +
				supportedTools.map((x) => `* ${x.id}` + (x.description ? `: ${x.description}` : ''))
					.join('\n'),
			parse: function(input) {
				if (!input || /^\s+$/.test(input))
					throw new Error('At least one tool id is required')

				let inputToolIds = input.split('+')
					.map((x) => x.trim())

				inputToolIds.forEach((toolId) => {
					if (!supportedToolIdSet.has(toolId))
						throw new Error(`${toolId} is not a supported tool`)
				})

				return inputToolIds
			},
			subModuleNames: function(parseResult) {
				return parseResult.map((toolId) => `Compute:${toolId}`)
			}
		}
	}

	/**
	 * @param {Array.<String>} toolIds - list of requested tool ids; however, some of these may be already done; however, at least one of ${toolIds} is not done.
	 */
	constructor(app, genome, requestedToolIds) {
		super(app, genome)
		this.requestedToolIds_ = requestedToolIds
		this.undoneToolIds_ = null
		this.aseqsService_ = new AseqsService(this.models_.Aseq)
	}

	dependencies() {
		return ['NCBICoreData']
	}

	optimize() {

	}

	run() {
		return this.aseqsMissingData_(this.undoneToolIds_)
		.then((aseqs) => {
			this.logger_.info(`Found ${aseqs.length} aseqs missing data for one of ${this.undoneToolIds_.join(', ')}`)
			let groups = this.aseqsService_.groupByUndoneTools(aseqs, this.undoneToolIds_)
			return this.computeGroups_(groups)
			.then(() => this.saveGroups_(groups))
		})
	}

	workerModuleRecords() {
		let sql = `
SELECT array_agg(substring(module, 9)) as done_compute_tool_ids
FROM ${this.models_.WorkerModule.getTableName()}
WHERE genome_id = ? AND module like 'Compute:%'`

		return this.sequelize_.query(sql, {
			replacements: [this.genome_.id],
			raw: true,
			type: this.sequelize_.QueryTypes.SELECT
		})
		.then((result) => {
			let doneComputeToolIds = result[0].done_compute_tool_ids || []
			this.undoneToolIds_ = arrayUtil.difference(this.requestedToolIds_, doneComputeToolIds)
			if (!this.undoneToolIds_.length)
				throw new Error(`Expected at least one requested tool id (${this.requestedToolIds_.join(', ')}) to be incomplete; however, all are marked as done`)

			return this.undoneToolIds_.map((toolId) => {
				let data = super.newWorkerModuleData()
				data.module += ':' + toolId
				return data
			})
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

	computeGroups_(groups) {
		return Promise.each(groups, (group) => {
			this.logger_.info({
				numAseqs: group.aseqs.length,
				toolIds: group.toolIds
			}, `Computing ${group.toolIds.join(', ')} for ${group.aseqs.length} aseqs`)
			return this.aseqsService_.compute(group.aseqs, group.toolIds)
		})
	}

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
