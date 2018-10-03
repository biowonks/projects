'use strict'

// Core
const assert = require('assert')

// Vendor
const {
  sortBy,
  sum,
} = require('lodash')

// Local
const { PrimaryRank } = require('./Stp/stp.constants.js')

module.exports =
class SignalTransductionService {
  constructor(models, version) {
    assert(/^[1-9]\d*$/.test(version), 'Cannot instantiate SignalTransductionService without a valid version')

    this.models_ = models
    this.version_ = version
    this.sequelize_ = models.Aseq.sequelize
    this.inputOutputCategories_ = null
    this.signalDomainMap_ = this.createSignalDomainMap_(this.version_)
      .then((signalDomainMap) => {
        this.inputOutputCategories_ = this.getDistinctInputOutputCategories_(signalDomainMap)
        return signalDomainMap
      })
  }

  domainProfile(genomeId) {
    return Promise.all([this.signalDomainMap_, this.fetchSignalGenesForGenome(genomeId, ['counts'])])
      .then((values) => {
        const [signalDomainMap, signalGenes] = values
        return this.tallyDomainProfile(signalDomainMap, signalGenes)
      })
  }

  fetchSignalGenesForGenome(genomeId, attributes) {
    return this.models_.SignalGene.findAll({
      attributes,
      include: {
        model: this.models_.Component,
        attributes: [],
        where: {
          genome_id: genomeId,
        },
        required: true,
      },
    })
  }

  tallyDomainProfile(signalDomainMap, signalGenes) {
    const lookupMap = new Map()
    signalGenes.forEach((signalGene) => {
      for (const [name, amount] of Object.entries(signalGene.counts)) {
        const signalDomain = signalDomainMap.get(name)
        if (!signalDomain) {
          continue
        }

        const { kind } = signalDomain
        // Only break out by function for input and output signal domains
        const isInputOrOutput = kind === 'input' || kind === 'output'
        const effectiveFunction = isInputOrOutput ? signalDomain.function : kind
        const key = isInputOrOutput ? kind + '.' + effectiveFunction : kind
        let group = lookupMap.get(key)
        if (!group) {
          group = {
            kind,
            function: effectiveFunction,
            numDomains: 0,
          }
          lookupMap.set(key, group)
        }
        group.numDomains += amount
      }
    })

    const takeGroupOrUseDefault = (key) => {
      let group = lookupMap.get(key)
      lookupMap.delete(key)
      if (!group)
        group = {kind: key, function: key, numDomains: 0}
      return group
    }

    const inputsOutputs = () => {
      return this.inputOutputCategories_
        .map((category) => {
          const key = category.kind + '.' + category.function
          return lookupMap.get(key) || {kind: category.kind, function: category.function, numDomains: 0}
        })
    }

    const ecf = takeGroupOrUseDefault('ecf')
    const unknown = takeGroupOrUseDefault('unknown')

    return [
      takeGroupOrUseDefault('chemotaxis'),
      takeGroupOrUseDefault('transmitter'),
      takeGroupOrUseDefault('receiver'),
      ...inputsOutputs(),
      ecf,
      unknown,
    ]
  }

  stpMatrix(genomeId, offset, limit) {
    return this.sequelize_.transaction((transaction) => {
      return Promise.all([
        this.componentTotals(genomeId, transaction),
        this.stpTotals(genomeId, transaction),
        this.stpComponentsInfo(genomeId, offset, limit, transaction),
      ]).then((results) => {
        const [componentTotals, stpTotals, components] = results
        const componentIds = components.map((component) => component.id)
        return this.stpRanksCounts(componentIds, transaction)
          .then((ranksCounts) => this.createStpMatrix_(components, ranksCounts, stpTotals))
          .then((stpMatrix) => {
            stpMatrix.numComponents = componentTotals.count
            stpMatrix.totalLength = componentTotals.totalLength
            return stpMatrix
          })
      })
    })
  }

  componentTotals(genomeId, transaction) {
    const componentTableName = this.models_.Component.getTableName()
    const sql = `
      SELECT count(*) as count, sum(length) as total_length
      FROM ${componentTableName}
      WHERE genome_id = ?
      LIMIT 1
    `
    return this.sequelize_.query(sql, {
      raw: true,
      replacements: [genomeId],
      transaction,
      type: this.sequelize_.QueryTypes.SELECT,
    })
    .then((rows) => {
      const result = {
        count: 0,
        totalLength: 0,
      }

      if (rows.length) {
        // For some reason the above query returns the count as a string :\
        result.count = parseInt(rows[0].count)
        result.totalLength = parseInt(rows[0].total_length)
      }
      return result
    })
  }

  stpTotals(genomeId, transaction) {
    const componentTableName = this.models_.Component.getTableName()
    const signalGeneTableName = this.models_.SignalGene.getTableName()
    const sql = `
      SELECT ranks, count(*) as count
      FROM ${componentTableName} a JOIN ${signalGeneTableName} b ON (a.id = b.component_id)
      WHERE a.genome_id = ?
      GROUP BY ranks
    `
    return this.sequelize_.query(sql, {
      raw: true,
      replacements: [genomeId],
      transaction,
      type: this.sequelize_.QueryTypes.SELECT,
    })
    .then((result) => {
      result.forEach((row) => {
        // For some reason the above query returns the count as a string :\
        row.count = parseInt(row.count)
      })
      return result
    })
  }

  stpComponentsInfo(genomeId, offset, limit, transaction) {
    return this.models_.Component.findAll({
      where: {
        genome_id: genomeId,
      },
      attributes: ['id', 'version', 'name', 'length'],
      order: [
        ['length', 'DESC'],
        'id',
      ],
      offset,
      limit,
      raw: true,
      transaction,
      type: this.sequelize_.QueryTypes.SELECT,
    })
  }

  stpRanksCounts(componentIds, transaction) {
    return this.models_.SignalGene.findAll({
      where: {
        component_id: componentIds,
      },
      attributes: [
        'component_id',
        'ranks',
        [this.sequelize_.fn('count', this.sequelize_.col('component_id')), 'count'],
      ],
      group: [
        'component_id',
        'ranks',
      ],
      raw: true,
      transaction,
      type: this.sequelize_.QueryTypes.SELECT,
    })
    .then((result) => {
      result.forEach((row) => {
        // For some reason the above query returns the count as a string :\
        row.count = parseInt(row.count)
      })
      return result
    })
  }

  // ------------------------------------------------------
  // Private methods
  createSignalDomainMap_(version) {
    return this.models_.SignalDomain.findAll({
      attributes: [
        'name',
        'kind',
        'function',
      ],
      where: {
        version,
      },
    })
    .then((rows) => {
      const result = new Map()
      rows.forEach((row) => {
        result.set(row.name, {kind: row.kind, function: row.function})
      })
      return result
    })
  }

  getDistinctInputOutputCategories_(signalDomainMap) {
    const makeKey = (signalDomain) => {
      return signalDomain.kind + '.' + signalDomain.function
    }

    const seen = new Set()
    const result = []
    Array.from(signalDomainMap.values())
      .filter((signalDomain) => signalDomain.kind === 'input' || signalDomain.kind === 'output')
      .forEach((signalDomain) => {
        const key = makeKey(signalDomain)
        if (seen.has(key))
          return

        seen.add(key)
        result.push({
          kind: signalDomain.kind,
          function: signalDomain.function,
        })
      })

    return sortBy(result, [
      (category) => category.kind,
      (category) => category.function,
    ])
  }

  createStpMatrix_(components, ranksCounts, stpTotals) {
    let numStp = 0
    let numChemotaxis = 0
    const counts = {}
    stpTotals.forEach((stpTotal) => {
      const jointRank = stpTotal.ranks.join(',')
      counts[jointRank] = stpTotal.count
      numStp += stpTotal.count
      if (stpTotal.ranks[0] === PrimaryRank.chemotaxis)
        numChemotaxis += stpTotal.count
    })

    const cidToComponent = {}
    components.forEach((component) => {
      cidToComponent[component.id] = component
      component.counts = {}
      component.numChemotaxis = 0
    })

    ranksCounts.forEach((ranksCount) => {
      const component = cidToComponent[ranksCount.component_id]
      const jointRank = ranksCount.ranks.join(',')
      component.counts[jointRank] = ranksCount.count
      if (ranksCount.ranks[0] === PrimaryRank.chemotaxis)
        component.numChemotaxis += ranksCount.count
    })

    components.forEach((component) => {
      component.numStp = sum(Object.values(component.counts))
    })

    return {
      components,
      counts,
      numChemotaxis,
      numStp,
    }
  }
}
