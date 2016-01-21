#!/usr/bin/env node

'use strict';

var fs = require('fs'),
	path = require('path');

var program = require('commander'),
	moment = require('moment');

var toolbag = require('../lib/toolbag'),
	config = require('../config');

var migrationDirectory = config.migrations.umzug.migrations.path,
	migrationTemplateFile = path.resolve(__dirname, 'migration-template.js');

program
	.usage('<migration sql file>')
	.parse(process.argv);

var sqlFile = program.args[0];
if (!sqlFile) {
	program.outputHelp();
	process.exit(1);
}

if (!toolbag.fileExists(sqlFile)) {
	console.error('SQL file:', sqlFile, 'does not exist!');	// eslint-disable-line no-console
	process.exit(1);
}

var relativeSqlFile = path.relative(migrationDirectory, path.resolve(sqlFile)),
	migrationTemplate = fs.readFileSync(migrationTemplateFile, 'utf-8'),
	migrationJs = migrationTemplate.replace('$SQL_FILE$', relativeSqlFile),
	sqlFileBasename = path.basename(sqlFile, '.sql'),
	migrationFilename = moment().format('YYYYMMDDHHmmss') + '-' + sqlFileBasename + '.js',
	migrationFile = path.resolve(migrationDirectory, migrationFilename);

fs.writeFileSync(migrationFile, migrationJs);
