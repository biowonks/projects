'use strict';

var _ = require('lodash');

var RestError = require('./errors/rest-error');

var CrudHelper = function(model) {
	if (!model)
		throw new Error('Missing model argument');

	this.model_ = model;
	this.reqIdKey_ = 'id';
	this.resLocalKey_ = 'entity';
	this.alternateIdEnabled_ = false;
	this.alternateIdKey_ = null;
};

CrudHelper.prototype.create = function(data) {
	return this.model_.create(this.pickData(data));
};

CrudHelper.prototype.createHandler = function() {
	return (req, res, next) => {
		this.create(req.body)
		.then((newEntity) => {
			res.status(201).json(this.wrapResponse(newEntity));
		})
		.catch(next);
	};
};

CrudHelper.prototype.deleteHandler = function() {
	return (req, res, next) => {
		var entity = res.locals[this.resLocalKey_];
		if (!entity)
			return res.status(204).end();

		entity.destroy()
		.then(() => {
			res.status(204).end();
		})
		.catch(next);
	};
};

CrudHelper.prototype.find = function(id) {
	if (!this.alternateIdEnabled_)
		return this.model_.findById(id);

	if (!this.alternateIdKey_)
		throw new Error('Search by alternate id enabled; however, the alternateId key is not defined');

	let where = {};

	// Assumes integral id and that the alternate_id is not integral
	if (/^\d+$/.test(id))
		where.id = id;
	else
		where[this.alternateIdKey_] = id;

	return this.model_.find({
		where: where
	});
};

CrudHelper.prototype.findMiddleware = function(optParamName) {
	return (req, res, next) => {
		let paramName = optParamName || this.reqIdKey_,
			id = req.params[paramName];
		this.find(id)
		.then((entity) => {
			if (!entity)
				return next(RestError.error404);

			res.locals[this.resLocalKey_] = entity;
			next();
		})
		.catch(next);
	};
};

CrudHelper.prototype.findAll = function() {
	return this.model_.findAll();
};

CrudHelper.prototype.findAllHandler = function() {
	return (req, res, next) => {
		this.findAll()
		.then((entities) => {
			res.json(this.wrapArrayResponse(entities));
		})
		.catch(next);
	};
};

CrudHelper.prototype.findHandler = function() {
	return (req, res, next) => {
		res.json(this.wrapResponse(res.locals[this.resLocalKey_]));
	};
};

CrudHelper.wrapResponse =
CrudHelper.prototype.wrapResponse = function(data, optMetaData) {
	return {
		data: data,
		meta: optMetaData
	};
};

CrudHelper.wrapArrayResponse =
CrudHelper.prototype.wrapArrayResponse = function(entities) {
	return this.wrapResponse(entities, {
		count: entities.length
	});
};

// ----------------------------------------------------------------------------
// Helper functions
CrudHelper.prototype.pickData = function(data) {
	return _.pick(data, this.model_.fieldNames);
};

CrudHelper.prototype.setAlternateIdKey = function(fieldName) {
	this.alternateIdKey_ = fieldName;
};

CrudHelper.prototype.setFindByAlternateIdEnabled = function(optEnabled) {
	this.alternateIdEnabled_ = optEnabled !== undefined ? optEnabled : true;
};

// ----------------------------------------------------------------------------
// Private functions

module.exports = CrudHelper;
