'use strict'

let parser = require('./migration-sql-parser')

describe('Migration SQL Parser', function() {
	describe('parse', function() {
		it('no arguments throws error', function() {
			expect(function() {
				parser.parse()
			}).throw(Error)
		})

		it("' ' is valid",
		function() {
			expect(parser.parse(' ')).deep.equal({
				up: ' ',
				down: null
			})
		})

		it('no optional delimiter returns all as up SQL',
		function() {
			let sql = '-- Comment\n' +
				'create table names (id serial, name text)\n'

			expect(parser.parse(sql)).deep.equal({
				up: sql,
				down: null
			})
		})

		it('returns both up and down SQL with the default delimiter',
		function() {
			let upSql = '-- Comment\n' +
				'create table names (id serial, name text)\n'
			let downSql = '-- Some down sql\n' +
				'drop table names'
			let sql = upSql + parser.kDefaultDelimiter + downSql

			expect(parser.parse(sql)).deep.equal({
				up: upSql,
				down: parser.kDefaultDelimiter + downSql
			})
		})
	})
})
