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
		(req, res, next) => {
			if (Reflect.has(req.query, 'search')) {
				const searchTerms = util.splitIntoTerms(req.query.search)
					.map((term) => `'(${term}:*)'`)
				if (searchTerms.length > 0)
					_.set(res.locals, 'criteria.where.search', searchTerms)
			}
			if (Reflect.has(req.query, 'superkingdom')) {
				const superkTerms = util.splitIntoTerms(req.query.superkingdom)
					.map((term) => `%${term}%`)
				if (superkTerms.length > 0)
					_.set(res.locals, 'criteria.where.superkingdom.$iLike.$any', superkTerms)
			}
			if (Reflect.has(req.query, 'phylum')) {
				const phylumTerms = util.splitIntoTerms(req.query.phylum)
					.map((term) => `%${term}%`)
				if (phylumTerms.length > 0)
					_.set(res.locals, 'criteria.where.phylum.$iLike.$any', phylumTerms)
			}
			if (Reflect.has(req.query, 'class')) {
				const classTerms = util.splitIntoTerms(req.query.class)
					.map((term) => `%${term}%`)
				if (classTerms.length > 0)
					_.set(res.locals, 'criteria.where.class.$iLike.$any', classTerms)
			}
			if (Reflect.has(req.query, 'orderr')) {
				const orderTerms = util.splitIntoTerms(req.query.orderr)
					.map((term) => `%${term}%`)
				if (orderTerms.length > 0)
					_.set(res.locals, 'criteria.where.orderr.$iLike.$any', orderTerms)
			}
			if (Reflect.has(req.query, 'family')) {
				const familyTerms = util.splitIntoTerms(req.query.family)
					.map((term) => `%${term}%`)
				if (familyTerms.length > 0)
					_.set(res.locals, 'criteria.where.family.$iLike.$any', familyTerms)
			}
			if (Reflect.has(req.query, 'genus')) {
				const genusTerms = util.splitIntoTerms(req.query.genus)
					.map((term) => `%${term}%`)
				if (genusTerms.length > 0)
					_.set(res.locals, 'criteria.where.genus.$iLike.$any', genusTerms)
			}
			if (Reflect.has(req.query, 'assembly_level')) {
				const assemblyTerms = util.splitIntoTerms(req.query.assembly_level)
					.map((term) => `%${term}%`)
				if (assemblyTerms.length > 0)
					_.set(res.locals, 'criteria.where.assembly_level.$iLike.$any', assemblyTerms)
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
