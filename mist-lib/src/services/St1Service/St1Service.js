'use strict'

// Core
const assert = require('assert')

// Vendor
const _ = require('lodash')

// Local
const Domain = require('Domain')
const RegionContainer = require('./RegionContainer')
const st1utils = require('./st1-utils')

function setContainsSomeDomains(someSet, domains) {
  if (!someSet || !domains)
    return false

  for (let domain of domains) {
    if (someSet.contains(domain.name))
      return true
  }
  return false
}

module.exports = {}
const PrimaryRank = module.exports.PrimaryRank = {
  ecf: 'ecf',
  ocp: 'ocp',
  tcp: 'tcp',
  chemotaxis: 'chemotaxis',
  other: 'other',
}

const SecondaryRank = module.exports.SecondaryRank = {
  chea: 'chea',
  cheb: 'cheb',
  checx: 'checx',
  ched: 'ched',
  cher: 'cher',
  chev: 'chev',
  chew: 'chew',
  chez: 'chez',
  hhk: 'hhk',
  hk: 'hk',
  hrr: 'hrr',
  rr: 'rr',
  mcp: 'mcp',
  other: 'other',
}

class StpiMatchHelper {
  constructor(stpiSpec) {
    const filters = {
      isMarker: {marker: true},
      isHK_CA: {id: 'HK_CA'},
      isHisKA: {id: 'HisKA'},
      isChemotaxis: {kind: 'chemotaxis'},
      isTransmitter: {kind: 'transmitter'},
      isReceiver: {kind: 'receiver'},
      isOutput: {kind: 'output'},
    }

    const agfam = _.filter(stpiSpec, {family: 'agfam'})
    const ecf = _.filter(stpiSpec, {family: 'ecf'})
    const pfam = _.filter(stpiSpec, {family: 'pfam'})
    const pfamEcf = _.filter(pfam, {kind: 'ecf'})
    this.groups = {
      agfam,
      agfamMarker: _.filter(agfam, filters.isMarker),
      agfamHatpase: _.filter(agfam, filters.isHK_CA),
      agfamTransmitter: _.filter(agfam, filters.isTransmitter),
      agfamReceiver: _.filter(agfam, filters.isReceiver),
      agfamChemo: _.filter(agfam, filters.isChemotaxis),
      agfamOutput: _.filter(agfam, filters.isOutput),

      ecf,
      ecfMarker: _.filter(ecf, filters.isMarker),

      pfam,
      pfamMarker: _.filter(pfam, filters.isMarker),
      pfamHatpase: _.filter(pfam, filters.isHK_CA),
      pfamHiska: _.filter(pfam, filters.isHisKA),
      pfamChemo: _.filter(pfam, filters.isChemotaxis),
      pfamTransmitter: _.filter(pfam, filters.isTransmitter),
      pfamReceiver: _.filter(pfam, filters.isReceiver),
      pfamEcf,
      pfamEcfMarker: _.filter(pfamEcf, filters.isMarker),
      pfamOutput: _.filter(pfam, filters.isOutput),
    }

    // Create sets of unique domain names for each group for quickly determining
    // membership to a group
    // e.g. [agfam] = Set([RR, HK_CA, HK_CA:1, ...])
    this.sets = {
      // Pfam domain names
      hdUnrelatedSignalDomains: new Set([
        'PolyA_pol',
        'TGS',
        'RelA_SpoT',
        'KH_1',
        'KH_2',
        'tRNA_anti',
        'PPx-GppA',
        'DEAD',
        'Helicase_C',
        'tRNA-synt_1d',
      ]),

      // Pfam domain names
      hkNonSignalDomains: new Set([
        'DNA_gyraseA_C',
        'DNA_gyraseB',
        'DNA_gyraseB_C',
        'Toprim',
        'HSP90',
        'DNA_topoisoIV',
        'DNA_mis_repair',
        'MutL_C',
        'Topo-VIb_trans',
      ]),
    }

    //      {group name}->{domain name} = signal domain
    // e.g. {agfam}->{RR} = {family: agfam, name: RR, ...}
    this.toSignalDomain = {}
    for (let [groupName, signalDomains] of Object.entries(this.groups)) {
      const nameToSignalDomain = {}
      signalDomains.forEach((signalDomain) => {
        nameToSignalDomain[signalDomain.name] = signalDomain
      })
      this.toSignalDomain[groupName] = nameToSignalDomain

      this.sets[groupName] = new Set(signalDomains.map((signalDomain) => signalDomain.name))
    }

    this.signalDomainIdToPfamNames = {}
    this.groups.pfam.forEach((signalDomain) => {
      const { id, name } = signalDomain
      const set = this.signalDomainIdToPfamNames[id]
      if (!set) {
        set = this.signalDomainIdToPfamNames[id] = new Set()
      }
      set.add(name)
    })
  }

  contains(domains, name) {
    if (!domains)
      return false

    for (let i = 0, z = domains.length; i < z; ++i) {
      if (domains[i].name === name)
        return true
    }

    return false
  }

  hasPrimaryMarker(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamMarker) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamMarker)
  }

  hasEcfMarker(bundle) {
    return setContainsSomeDomains(bundle.ecf, this.sets.ecfMarker)
  }

  hasHatpase(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamHatpase) ||
      setContainsSomeDomains(bundle.pfam, this.sets.pfamHiska) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamHatpase)
  }

  hasHpt(bundle) {
    return this.contains(pfam, 'Hpt')
  }

  hasTransmitter(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamTransmitter) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamTransmitter)
  }

  hasReceiver(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamReceiver) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamReceiver)
  }

  hasOutput(bundle) {
    return setContainsSomeDomains(bundle.agfam, this.sets.agfamOutput) ||
      setContainsSomeDomains(bundle.pfam, this.sets.pfamOutput)
  }

  hasPfamEcf(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamEcf)
  }

  hasPfamEcfMarker(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamEcfMarker)
  }

  isChemotaxis(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamChemo) ||
      setContainsSomeDomains(bundle.afam, this.sets.agfamChemo)
  }

  isHdWithUnrelatedDomains(bundle) {
    return this.contains(bundle.pfam, 'HD') &&
      setContainsSomeDomains(bundle.pfam, this.sets.hdUnrelatedSignalDomains)
  }

  isNonSignalingHK(bundle) {
    return this.hasHatpase(bundle) &&
      setContainsSomeDomains(bundle.pfam, this.sets.hkNonSignalDomains)
  }

  findNterminalHatpase(bundle) {
    let hatpase = this.findNterminalKind_(bundle.agfam, this.sets.agfamHatpase)
    hatpase = this.findNterminalHatpase(bundle.pfam, this.sets.pfamHatpase, hatpase)
    return hatpase
  }

  findNterminalReceiver(bundle) {
    let receiver = this.findNterminalKind_(bundle.agfam, this.sets.agfamReceiver)
    receiver = this.findNterminalHatpase(bundle.pfam, this.sets.pfamReceiver, receiver)
    return receiver
  }

  findNterminalKind_(domains, targetSet, currentMatch = null) {
    for (let domain of domains) {
      if (targetSet.contains(domain.name) && (!currentMatch || domain.start < currentMatch.start)) {
        currentMatch = domain
      }
    }
    return currentMatch
  }
}

module.exports.St1Service =
class St1Service {
  static PFAM_TOOL_ID = 'pfam31'
  static AGFAM_TOOL_ID = 'agfam2'
  static ECF_TOOL_ID = 'ecf1'
  static THRESHOLD = .001
  static MAX_HYBRID_RECEIVER_START = 60

  static create(stpiSpecFile) {
    return st1utils.parseSTPISpec(stpiSpecFile)
      .then((stpiSpec) => new St1Service(stpiSpec))
  }

  constructor(stpiSpec) {
    this.stpiSpec_ = stpiSpec
    this.matchHelper_ = new StpiMatchHelper(stpiSpec)
  }

  analyze(aseq) {
    const bundle = this.createDomainBundle_(aseq)
    const ranks = this.predictRanks_()
    if (!ranks)
      return null

    this.removeNonSignalingDomains_(bundle)
    this.removeOverlappingDomains_(bundle)
    st1utils.sortByStart(bundle.pfam)

    const agfamSignalDomains = this.analyzeAgfamDomains_(bundle.agfam, bundle.pfam)
    const pfamSignalDomains = this.analyzePfamDomains_(bundle.pfam)
    const isEcf = ranks[0] === PrimaryRank.ecf
    const ecfSignalDomains = isEcf ? this.analyzeEcfDomains_(bundle.ecf) : []

    const signalDomains = [
      ...agfamSignalDomains,
      ...pfamSignalDomains,
      ...ecfSignalDomains,
    ]

    return this.summarize_(signalDomains, ranks)
  }

  createDomainBundle_(aseq) {
    const bundle = {
      pfam: (aseq[St1Service.PFAM_TOOL_ID] || []).map(Domain.createFromHmmer3),
      agfam: (aseq[St1Service.AGFAM_TOOL_ID] || []).map(Domain.createFromHmmer3),
      ecf: (aseq[St1Service.ECF_TOOL_ID] || []).map(Domain.createFromHmmer2),
    }

    for (let key in bundle)
      st1utils.sortByEvalue(bundle[key])

    st1utils.removeInsignificantOverlaps(bundle.pfam, St1Service.THRESHOLD)

    return bundle
  }

  predictRanks_(bundle) {
    if (this.matchHelper_.hasPrimaryMarker(bundle))
      return this.predictMarkerRanks_(bundle)
    else if (this.matchHelper_.hasEcfMarker(bundle))
      return [PrimaryRank.ecf]

    return null
  }

  // Assume that bundle has at least one match to a marker
  predictMarkerRanks_(bundle) {
    if (this.matchHelper_.isHdWithUnrelatedDomains(bundle) || this.matchHelper_.isNonSignalingHK(bundle)) {
      return null
    }

    if (this.matchHelper_.isChemotaxis(bundle))
      return this.getChemotaxisRanks_(bundle)

    const tcpRanks = this.getTwoComponentRanks_(bundle)
    if (tcpRanks)
      return tcpRanks

    // 25 August 2010 - check for ecf domains that overlap with the Sigma70_r2, Sigma70_r4, or Sigma70_r4_2 or pfam ECF
    // (e.g. Sigma70_ECF) signaling marker domains. Give preference to ECF domain prediction in these cases.
    const { pfam } = bundle
    if (this.matchHelper_.hasEcfMarker(bundle) &&
      (this.matchHelper_.contains(pfam, 'Sigma70_r2') ||
       this.matchHelper_.contains(pfam, 'Sigma70_r4') ||
       this.matchHelper_.contains(pfam, 'Sigma70_r4_2') ||
       this.matchHelper_.hasPfamEcf(bundle)
      )) {
      return [PrimaryRank.ecf]
    } else if (this.matchHelper_.hasPfamEcfMarker(bundle)) {
      return [PrimaryRank.ecf]
    }
    // End 25 August 2010

    // Two possibilities:
    // A. Only contains input domains, and no other pfam/unknown region and thus we do not know what it belongs to
    // B. Contains an output domain and/or an unknown domain in conjunction with a definite input domain
    //
    // Changed September 14th
    // If it has an output domain -> 1CP
    // else -> Other

    // Currently, all output domains are defined by pfam models, so we simply have to check
    // all of its domains for their output status
    if (this.matchHelper_.hasOutput(bundle))
      return [PrimaryRank.ocp]

    return [PrimaryRank.other]
  }

  getChemotaxisRanks_(bundle) {
    const ranks = [PrimaryRank.chemotaxis]
    const {agfam, pfam} = bundle

    if (this.matchHelper_.contains(pfam, 'CheW')) {
      if (this.matchHelper_.hasTransmitter(bundle) || this.matchHelper_.contains(agfam, 'HK_CA:Che'))
        ranks.push(SecondaryRank.chea)
      else if (this.matchHelper_.hasReceiver(bundle))
        ranks.push(SecondaryRank.chev)
      else
        ranks.push(SecondaryRank.chew)
    } else if (this.matchHelper_.contains(pfam, 'CheB_methylest')) {
      ranks.push(SecondaryRank.cheb)
    } else if (this.matchHelper_.contains(pfam, 'CheR') || this.matchHelper_.contains(pfam, 'CheR_N')) {
      ranks.push(SecondaryRank.cher)
    } else if (this.matchHelper_.contains(pfam, 'CheD')) {
      ranks.push(SecondaryRank.ched)
    } else if (this.matchHelper_.contains(pfam, 'CheZ')) {
      ranks.push(SecondaryRank.chez)
    } else if (this.matchHelper_.contains(pfam, 'CheC') && !this.matchHelper_.contains(pfam, 'SpoA')) {
      ranks.push(SecondaryRank.checx)
    } else if (this.matchHelper_.contains(pfam, 'MCPsignal')) {
      ranks.push(SecondaryRank.mcp)
    } else {
      ranks.push(SecondaryRank.other)
    }

    return ranks
  }

  getTwoComponentRanks_(bundle) {
    const hasTransmitter = this.matchHelper_.hasTransmitter(bundle)
    const hasReceiver = this.matchHelper_.hasReceiver(bundle)
    if (!hasTransmitter && !hasReceiver)
      return null

    const ranks = [PrimaryRank.tcp]
    const hasHatpase = this.matchHelper_.hasHatpase(bundle)
    if (hasHatpase && hasReceiver) {
      const hybridRank = this.getHybridTwoComponentRank_(bundle)
      assert(hybridRank)
      ranks.push(hybridRank)
    } else if (hasHatpase) {
      ranks.push(SecondaryRank.hk)
    } else if (hasReceiver) {
      ranks.push(SecondaryRank.rr)
    } else {
      ranks.push(SecondaryRank.other)
    }

    return ranks
  }

  getHybridTwoComponentRank_(bundle) {
    const firstReceiver = this.matchHelper_.findNterminalReceiver(bundle)
    const firstHatpase = this.matchHelper_.findNterminalHatpase(bundle)

    if (!firstReceiver || !firstHatpase)
      return null

    if (firstReceiver.start < firstHatpase.start) {
      if (firstReceiver.start <= St1Service.MAX_HYBRID_RECEIVER_START)
        return SecondaryRank.hrr

      return SecondaryRank.other
    }

    return SecondaryRank.hhk
  }

  // --------------------------
  removeNonSignalingDomains_(bundle) {
    bundle.pfam = bundle.pfam.filter((pfamDomain) => this.sets.pfam.contains(pfamDomain))
    // Currenty all agfam domains are involved in signal transduction
  }

  removeOverlappingDomains_(bundle) {
    const container = new RegionContainer()
    st1utils.removeOverlappingDomains(container, bundle.agfam)
    st1utils.removeOverlappingDomains(container, bundle.pfam)
  }

  analyzeAgfamDomains_(agfamDomains, pfamDomains) {
    const signalDomains = agfamDomains
      .map((agfamDomain) => {
        const signalDomain = this.matchHelper_.toSignalDomain.agfam[agfamDomain.name]
        if (!signalDomain)
          return

        const equivalentPfamNameSet = this.matchHelper_.signalDomainIdToPfamNames[signalDomain.id]
        st1utils.removeSpecificDomainsOverlappingWith(agfamDomain, equivalentPfamNameSet, pfamDomains)

        // Remove any pfam HisKA domains that are immediately upstream (within 60 aa)
        // of the identified Agfam histidine kinase domain.
        if (signalDomain.id === 'HK_CA' || signalDomain.id === 'HK:Che') {
          for (let i = pfamDomains.length - 1; i >= 0; --i) {
            const pfamDomain = pfamDomains[i]
            const name = pfamDomain.name
            if (this.matchHelper_.signalDomainIdToPfamNames.HK_CA.has(name) &&
                pfamDomain.start < agfamDomain.start &&
                pfamDomain.stop + 60 >= agfamDomain.start
              ) {
              pfamDomains.splice(i, 1)
            }
          }
        }

        return signalDomain
      })

    return signalDomains
  }

  analyzePfamDomains_(pfamDomains) {
    const signalDomains = []
    for (let i = 0, z = pfamDomains.length; i < z; i++) {
      const pfamDomain = pfamDomains[i]
      const signalDomain = this.matchHelper_.toSignalDomain.pfam[pfamDomain.name]
      if (!signalDomain)
        continue

      signalDomains.push(signalDomain)

      // Special case for HK_CA
      if (signalDomain.id === 'HK_CA') {
        // Since there are multiple models for the histidine kinase substructure,
        // Only count pairs of X + HK_CA or cases where the distance between
        // X and HK_CA is <= 60
        //
        // See case study: hiska_hatpase_spacing for details surrounding the use of 60 amino acids
        if (pfamDomain.name !== 'HK_CA' &&
            i + 1 < z &&
            pfamDomains[i+1].name === 'HK_CA' &&
            pfamDomain.stop + 60 >= pfamDomains[i+1].start
          ) {
          ++$i
        }
      }
    }
    return signalDomains
  }

  analyzeEcfDomains_(ecfDomains) {
    st1utils.removeOverlappingDomains(new RegionContainer(), ecfDomains)

    return ecfDomains.map((ecfDomain) => this.matchHelper_.toSignalDomain.ecf[ecfDomain.name])
      .filter((signalDomain) => !!signalDomain)
  }

  summarize_(signalDomains, ranks) {
    // Tally up inputs / outputs / input functions / output functions
    const domainCounts = {}
    const idSets = {
      input: new Set(),
      output: new Set(),
    }
    const functionSets = {
      input: new Set(),
      output: new Set(),
    }
    signalDomains.forEach((signalDomain) => {
      const { id, kind } = signalDomain
      if (!domainCounts[id])
        domainCounts[id] = 0
      domainCounts[id]++

      if (kind !== 'input' && kind !== 'output')
        return

      idSets[kind].add(id)
      functionSets[kind].add(signalDomain.function)
    })

    // Special case: prioritize ECF over DNA bunding function
    if (ranks[0] === PrimaryRank.ecf)
      functionSets.output.delete('DNA-binding')

    return {
      domainCounts,
      inputDomains: Array.from(idSets.input).sort(),
      inputFunctions: Array.from(functionSets.input).sort(),
      outputDomains: Array.from(idSets.output).sort(),
      outputFunctions: Array.from(functionSets.output).sort(),
      ranks,
    }
  }
}
