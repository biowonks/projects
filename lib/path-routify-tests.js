'use strict';

var expect = require('chai').expect,
	express = require('express'),
	path = require('path'),
	supertestAsPromised = require('supertest-as-promised');

var pathRoutify = require('./path-routify');

describe('path-routify', function() {
	var app = express(),
		request = supertestAsPromised(app);

	app.set('logger', require('../services/logger-service')());

	describe('No prefix', function() {
		before(function() {
			pathRoutify(app, path.resolve(__dirname, 'test-routes'));
		});

		it('GET /',
		function() {
			return request.get('/')
				.expect(200)
				.expect('GET /');
		});

		it('PUT /',
		function() {
			return request.put('/')
				.expect(200)
				.expect('PUT /');
		});

		it('GET /alpha - should call middleware',
		function() {
			return request.get('/alpha')
				.expect(200)
				.then(function(res) {
					expect(res.body.data).deep.equal(['mw1', '/alpha']);
				});
		});

		it('GET /blogs/34',
		function() {
			return request.get('/blogs/34')
				.expect(200)
				.then(function(res) {
					expect(res.body).deep.equal({
						routeName: '/blogs/:id',
						id: '34'
					});
				});
		});

		it('GET /alpha/beta - should call two middlewares',
		function() {
			return request.get('/alpha/beta')
				.expect(200)
				.then(function(res) {
					expect(res.body.data).deep.equal(['mw1', 'mw2', '/alpha/beta']);
				});
		});
	});
});
