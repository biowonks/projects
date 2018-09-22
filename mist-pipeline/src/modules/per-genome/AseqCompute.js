'use strict'

// Core
const assert = require('assert')

// Local
const PerGenomePipelineModule = require('lib/PerGenomePipelineModule')
const AseqsComputeService = require('lib/services/AseqsComputeService')
const AseqModelFn = require('seqdepot-lib/models/Aseq.model')

// Other
const kAseqModelToolIdSet = new Set(AseqModelFn.kToolIdFieldNames)
const kSupportedTools = AseqsComputeService.tools()
	.filter((x) => kAseqModelToolIdSet.has(x.id) && !x.hidden)
const kSupportedSubModuleMap = new Map(kSupportedTools.map((x) => [
		x.id,
		{
			dependencies: x.dependencies,
			description: x.description,
		},
	]))

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
		this.aseqsService_ = new AseqsComputeService(this.models_, this.models_.Aseq, app.config, this.logger_)
		this.totalAseqsToProcess_ = null
	}

	undo() {
		this.logger_.info('Aseq computations are preserved regardless of undo. Skipping operation')
	}

	run() {
		return this.sequelize_.transaction({
			isolationLevel: 'READ COMMITTED'
		}, (transaction) => {
			return this.doRun(transaction)
		})
	}

	/**
	 * @returns {Array.<Object>} - an array of worker module records, one for each tool id provided to the constructor
	 */
	workerModuleRecords() {
		return this.toolIds_.map((toolId) => {
			let data = this.newWorkerModuleData()
			data.module += ':' + toolId
			return data
		})
	}

	// ----------------------------------------------------
	// Protected methods
	doRun(transaction) {
		return this.aseqsMissingData_(this.toolIds_, transaction)
		.then((aseqs) => {
			this.totalAseqsToProcess_ = aseqs.length
			let toolIdString = this.toolIds_.join(', ')
			if (!aseqs.length) {
				this.logger_.info(`All ${toolIdString} for this genome has already been precomputed`)
				return null
			}

			this.logger_.info(`${aseqs.length} aseqs are missing data for some of ${toolIdString}`)
			this.shutdownCheck_()
			let groups = this.aseqsService_.groupByUndoneTools(aseqs, this.toolIds_)
			return this.computeGroups_(groups)
			.then(() => this.saveGroups_(groups, transaction))
			.then(() => aseqs)
		})
	}

	/**
	 * The following provides for derived modules to provide alternate criteria for re-running
	 * a particular slice of data. This default implementation does nothing. See the Stp module
	 * for an example of how this is used otherwise.
	 */
	alternateAseqsMissingDataCondition() {
		return null
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

		const {Component, Gene, Aseq} = this.models_
		const targetAseqFields = this.aseqsService_.targetAseqFields(toolIds)
		const otherAseqFields = targetAseqFields.length ? ', ' + targetAseqFields.join(', ') : ''
		const toolSelectFields = toolIds.map((x) => `case when ${x} is not null then 1 else null end`).join(', ')
		const anyToolNullClause = toolIds.map((x) => x + ' is null').join(' OR ')
		const alternateCondition = this.alternateCondition_()
		const sql = `
SELECT c.id, c.sequence, ${toolSelectFields} ${otherAseqFields}
FROM ${Component.getTableName()} a JOIN ${Gene.getTableName()} b ON (a.id = b.component_id)
	JOIN ${Aseq.getTableName()} c ON (b.aseq_id = c.id)
WHERE a.genome_id = ? AND b.aseq_id is not null AND (${anyToolNullClause} ${alternateCondition})
ORDER BY b.id`

		return this.sequelize_.query(sql, {
			model: this.models_.Aseq,
			replacements: [this.genome_.id],
			transaction: optTransaction,
			type: this.sequelize_.QueryTypes.SELECT,
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
	 * @param {Transaction} transaction
	 * @returns {Promise}
	 */
	saveGroups_(groups, transaction) {
		const alternateCondition = this.alternateCondition_()
		return Promise.each(groups, (group) => {
			this.logger_.info({
				numAseqs: group.aseqs.length,
				toolIds: group.toolIds
			}, `Saving ${group.toolIds.join(', ')} results for ${group.aseqs.length} aseqs`)
			return this.aseqsService_.saveToolData(group.aseqs, group.toolIds, alternateCondition, transaction)
		})
	}

	alternateCondition_() {
		let alternateCondition = this.alternateAseqsMissingDataCondition() || ''
		if (alternateCondition)
			alternateCondition = 'OR (' + alternateCondition + ')'
		return alternateCondition
	}
}
