'use strict';

var fs = require('fs'),
	path = require('path');

var migrationSqlParser = require(path.resolve(__dirname, 'migration-sql-parser'));

var sqlFile = path.resolve(__dirname, 'sql/b_id_sequences.sql'),
	sql = migrationSqlParser.parse(fs.readFileSync(sqlFile, 'utf-8'));

module.exports = {
	up: function(migration, DataTypes) {
		return migration.sequelize.query(sql.up);
	},
	down: function(migration, DataTypes) {
		if (!sql.down)
			throw new Error('Down migration called, but no corresponding SQL found (file: ' + sqlFile + ')');

		return migration.sequelize.query(sql.down);
	}
};
