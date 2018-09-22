#!/usr/bin/env node

'use strict'

// Core
const assert = require('assert')
const fs = require('fs')

// Vendor
const program = require('commander')

// Local
const { pluck, readStpSpecFile } = require('./services/stp/stp-utils')

// Constants
const kSignalDomainsTableName = 'signal_domains'
const kSignalDomainsTableFields = ['name', 'version', 'kind', 'function']
const kSignalDomainMembersTableName = 'signal_domains_members'
const kSignalDomainMembersTableFields = [
  // excluded signal_domain_id as this is handled individually below
  'accession',
  'name',
  'superfamily',
  'description',
  'specific',
  'source',
  'pubmed_ids',
  'pdb_ids',
]

program
.description(`
Generate migration SQL from a tab-delimited signal transduction specification.

The spec file should embed the target version in its file name by following
the following name structure:

  stp-spec.<version>.tsv

  where <version> is a positive integer.`)
.usage('<stp spec file>')
.parse(process.argv)

const [stpSpecFile] = program.args
if (!stpSpecFile) {
  dieWithHelp()
}

const version = extractVersion(stpSpecFile)
if (version === null) {
  dieWithHelp(`FATAL: Unable to find version in "${stpSpecFile}". Please ensure the file name is formatted correctly.\n`)
}

readStpSpecFile(stpSpecFile)
.then((specRows) => {
  const grouped = groupBy(specRows, 'group_name')
  const reshaped = reshape(grouped)
  const upSql = generateUpSql(reshaped)
  const downSql = generateDownSql(reshaped)

  console.log(upSql)
  console.log('\n-- MIGRATION DOWN SQL')
  console.log(downSql)
})
.catch((error) => {
  console.error(error)
  process.exit(1)
})

// --------------------------------------------------------
function dieWithHelp(error) {
  if (error) {
    console.error(error)
  }
  program.outputHelp()
  process.exit()
}

function extractVersion(fileName) {
  const matches = /stp-spec\.(\d+)\.tsv$/i.exec(fileName)
  return matches && matches[1]
}

function groupBy(rows, fieldName) {
  const result = {}
  rows.forEach((row) => {
    const fieldValue = row[fieldName]
    if (!result[fieldValue]) {
      result[fieldValue] = []
    }

    result[fieldValue].push(row)
  })
  return result
}

function reshape(groupedRows) {
  const result = []
  for (let [groupName, memberRows] of Object.entries(groupedRows)) {
    assert(memberRows.length > 0)
    const firstRow = memberRows[0]
    const signalDomain = {
      name: groupName,
      version,
      kind: firstRow.kind,
      function: firstRow.function,
      _members: memberRows.map((memberRow) => pluck(memberRow, kSignalDomainMembersTableFields)),
    }
    result.push(signalDomain)
  }
  return result
}

function generateUpSql(data) {
  const sqlLines = []
  data.forEach((signalDomain) => {
    const signalDomainValues = generateInsertValues(signalDomain, kSignalDomainsTableFields)
    sqlLines.push(`insert into ${kSignalDomainsTableName} (${kSignalDomainsTableFields.join(', ')}) values (${signalDomainValues});`)

    sqlLines.push(`insert into ${kSignalDomainMembersTableName} (signal_domain_id, ${kSignalDomainMembersTableFields.join(', ')}) values`)

    const valueLines = signalDomain._members.map((member) => {
      const memberValues = generateInsertValues(member, kSignalDomainMembersTableFields)
      return `  (currval(pg_get_serial_sequence('${kSignalDomainsTableName}', 'id')), ${memberValues})`
    })
    valueLines[valueLines.length - 1] += ';\n'
    sqlLines.push(valueLines.join(',\n'))
  })

  return sqlLines.join('\n')
}

function generateDownSql(data) {
  return data
    .map((signalDomain) => `delete from ${kSignalDomainsTableName} where name = '${signalDomain.name}' and version = ${signalDomain.version};`)
    .join('\n')
}

function generateInsertValues(row, fieldNames) {
  return fieldNames.map((fieldName) => sqlValue(row[fieldName]))
    .join(', ')
}

function sqlValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'NULL'
    }

    return 'array[' + value.map((x) => sqlValue(x))
      .join(', ') + ']'
  }

  if (value === null) {
    return 'NULL'
  }

  if (value === true) {
    return 'true'
  }

  if (value === false) {
    return 'false'
  }

  if (/^\d+$/.test(value)) {
    return value
  }

  return quote(value)
}

function quote(value) {
  return `E'` + value.replace(/'/g, `\\'`) + `'`
}