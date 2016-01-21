// This file should be placed in the same directory as the resulting
// migrations

'use strict';

module.exports = {
	parse: function(migrationSql, optDelimiter) {
		if (!migrationSql)
			throw new Error('Must have valid migration sql');

		if (typeof migrationSql !== 'string')
			throw new Error('Migration SQL must be string; got ' + typeof migrationSql + ' instead');

		var delimiter = optDelimiter || '\n-- DOWN\n',
			delimiterPosition = migrationSql.indexOf(delimiter),
			upSql = null,
			downSql = null;

		if (delimiterPosition >= 0) {
			upSql = migrationSql.substr(0, delimiterPosition);
			downSql = migrationSql.substr(delimiterPosition);
		}
		else {
			upSql = migrationSql;
		}

		return {
			up: upSql,
			down: downSql
		};
	}
};
