'use strict';

var expect = require('chai').expect;

var parser = require('./migration-sql-parser');

describe('Migration SQL Parser', function() {
	var delimiter = '\n-- DOWN\n';

	it('parse() should throw',
	function() {
		expect(function() {
			parser.parse();
		}).throw;
	});

	it('parse(\' \') should work',
	function() {
		expect(parser.parse(' ')).deep.equal({
			up: ' ',
			down: null
		});
	});

	it('parse(...) without any delimiter content should return all up SQL',
	function() {
		var sql = '-- Comment\n' +
			'create table names (id serial, name text);\n';

		expect(parser.parse(sql)).deep.equal({
			up: sql,
			down: null
		});
	});

	it('parse(...) with default delimiter content should return both up and down SQL',
	function() {
		var upSql = '-- Comment\n' +
			'create table names (id serial, name text);\n';
		var downSql = '-- Some down sql\n' +
			'drop table names;';
		var sql = upSql + delimiter + downSql;

		expect(parser.parse(sql)).deep.equal({
			up: upSql,
			down: delimiter + downSql
		});
	});
});
