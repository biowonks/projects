'use strict'

// Vendor
const _ = require('lodash')

// Local
const util = require('core-lib/util')

module.exports = function(app, middlewares, routeMiddlewares) {
	let models = app.get('models'),
		helper = app.get('lib').RouteHelper.for(models.Genome),
		sequelize = app.get('sequelize')

	return [
		middlewares.parseCriteriaForMany(models.Genome, {
			accessibleModels: [
				models.WorkerModule,
				models.Component
			],
			maxPage: null,
			permittedOrderFields: '*',
			permittedWhereFields: [
				'taxonomy_id',
			],
		}),
		// Provide for searching against name, taxonomy levels and assembly_level
		//In a query all the terms except 'search' are expected to be one word terms, nevetherless as a precaution
		//all the terms are being taken and concatenated.
		(req, res, next) => {
			if (Reflect.has(req.query, 'search')) {
				const searchTerm = util.splitIntoTerms(req.query.search)
					.map((term) => `'(${term}:*)'`).join(" & ").replace(/' & '/g, ' & ')
				if (searchTerm.length > 0)
					_.set(res.locals, 'criteria.where.search', searchTerm)
			}
			if (Reflect.has(req.query, 'superkingdom')) {
				const superkTerm = util.splitIntoTerms(req.query.superkingdom).join(" ")
				if (superkTerm.length > 0)
					_.set(res.locals, 'criteria.where.superkingdom', `'${superkTerm}'`)
			}
			if (Reflect.has(req.query, 'phylum')) {
				const phylumTerm = util.splitIntoTerms(req.query.phylum).join(" ")
				if (phylumTerm.length > 0)
					_.set(res.locals, 'criteria.where.phylum', `'${phylumTerm}'`)
			}
			if (Reflect.has(req.query, 'class')) {
				const classTerm = util.splitIntoTerms(req.query.class).join(" ")
				if (classTerm.length > 0)
					_.set(res.locals, 'criteria.where.class', `'${classTerm}'`)
			}
			if (Reflect.has(req.query, 'orderr')) {
				const orderTerm = util.splitIntoTerms(req.query.orderr).join(" ")
				if (orderTerm.length > 0)
					_.set(res.locals, 'criteria.where.orderr', `'${orderTerm}'`)
			}
			if (Reflect.has(req.query, 'family')) {
				const familyTerm = util.splitIntoTerms(req.query.family).join(" ")
				if (familyTerm.length > 0)
					_.set(res.locals, 'criteria.where.family', `'${familyTerm}'`)
			}
			if (Reflect.has(req.query, 'genus')) {
				const genusTerm = util.splitIntoTerms(req.query.genus).join(" ")
				if (genusTerm.length > 0)
					_.set(res.locals, 'criteria.where.genus', `'${genusTerm}'`)
			}
			if (Reflect.has(req.query, 'assembly_level')) {
				const assemblyTerm = util.splitIntoTerms(req.query.assembly_level).join(" ")
				if (assemblyTerm.length > 0)
					_.set(res.locals, 'criteria.where.assembly_level', `'${assemblyTerm}'`)
			}
			next()
		},
		helper.findManyHandler(sequelize)
	]
}

module.exports.docs = function(modelExamples) {
	return {
		name: 'Fetch Many Genomes',
		description: 'Returns an array of <a href="#genome-model">Genomes</a>.',
		method: null,
		uri: null,
		parameters: null,
		example: {
			response: {
				body: [
					modelExamples.Genome
				]
			}
		},
		har: null
	}
}
