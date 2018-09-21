#!/usr/bin/env node

'use strict'

// Core
const assert = require('assert')
const fs = require('fs')

// Vendor
const program = require('commander')
const split = require('split')

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

readSpecFile(stpSpecFile)
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
  process.exit(1)
}

function extractVersion(fileName) {
  const matches = /stp-spec\.(\d+)\.tsv$/i.exec(fileName)
  return matches && matches[1]
}

const kSpecFieldNames = new Set([
  'group_name',
  'accession',
  'name',
  'superfamily',
  'description',
  'function',
  'kind',
  'specific',
  'source',
  'pubmed_ids',
  'pdb_ids',
])
function readSpecFile(file) {
  return tsv2array(file)
    .then((rows) => {
      rows.forEach((row) => {
        row.group_name = row.group_name || row.name

        if (row.specific) {
          const specific = row.specific.toLowerCase()
          row.specific = specific === 'yes' || specific == 1 || specific === 'true'
        } else {
          row.specific = false
        }

        row.pubmed_ids = combineIds(row, 'pubmed', 3, /^\d+$/)
        row.pdb_ids = combineIds(row, 'pdb', 3, /^\S+$/)
      })

      return rows.map((row) => pluck(row, kSpecFieldNames))
    })
}

function tsv2array(file) {
  return new Promise((resolve, reject) => {
    const result = []
    let headerFields

    fs.createReadStream(file)
      .pipe(split())
      .on('data', (line) => {
        const isEmptyLine = /^\s*$/.test(line)
        if (isEmptyLine)
          return

        if (headerFields) {
          const parts = line.split(/\t/)
          const row = {}
          headerFields
            .forEach((fieldName, i) => {
              row[fieldName] = !!parts[i] ? parts[i].trim() : null
            })

          result.push(row)
        } else {
          headerFields = line.toLowerCase().split(/\t/)
        }
      })
      .on('error', reject)
      .on('end', () => {
        resolve(result)
      })
  })
}

function combineIds(row, prefix, amount, regex) {
  const ids = []
  for (let i = 1; i <= amount; i++) {
    const fieldName = prefix + i
    const id = row[fieldName]
    if (id && regex.test(id)) {
      ids.push(id)
    }
  }
  return ids
}

function pluck(row, fieldNames) {
  const result = {}
  fieldNames.forEach((fieldName) => {
    result[fieldName] = Reflect.has(row, fieldName) ? row[fieldName] : null
  })
  return result
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