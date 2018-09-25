'use strict'

// Core
const assert = require('assert')

// Vendor
const { sortBy } = require('lodash')

module.exports =
class SignalTransductionService {
  constructor(models, version) {
    assert(/^[1-9]\d*$/.test(version), 'Cannot instantiate SignalTransductionService without a valid version')

    this.models_ = models
    this.version_ = version
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
      takeGroupOrUseDefault('receiver'),
      takeGroupOrUseDefault('transmitter'),
      ...inputsOutputs(),
      ecf,
      unknown,
    ]
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
}
