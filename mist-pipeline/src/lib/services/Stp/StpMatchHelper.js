'use strict';

// Core
const assert = require('assert');

// Vendor
const _ = require('lodash');

// Local
const {pfamHDUnrelatedSignalDomains, pfamHKNonSignalDomains} = require('mist-lib/services/stp.constants');
const {setContainsSomeDomains} = require('./stp-utils');

module.exports =
class StpMatchHelper {
  constructor(stpSpec) {
    assert(Array.isArray(stpSpec));

    const filters = {
      isSpecific: {specific: true},
      isHK_CA: {id: 'HK_CA'},
      isHisKA: {id: 'HisKA'},
      isChemotaxis: {kind: 'chemotaxis'},
      isTransmitter: {kind: 'transmitter'},
      isReceiver: {kind: 'receiver'},
      isOutput: {kind: 'output'},
    };

    const agfam = _.filter(stpSpec, {source: 'agfam'});
    const ecf = _.filter(stpSpec, {source: 'ecf'});
    const pfam = _.filter(stpSpec, {source: 'pfam'});
    const pfamEcf = _.filter(pfam, {kind: 'ecf'});
    this.groups = {
      agfam,
      agfamMarker: _.filter(agfam, filters.isSpecific),
      agfamHatpase: _.filter(agfam, filters.isHK_CA),
      agfamTransmitter: _.filter(agfam, filters.isTransmitter),
      agfamReceiver: _.filter(agfam, filters.isReceiver),
      agfamChemo: _.filter(agfam, filters.isChemotaxis),
      agfamOutput: _.filter(agfam, filters.isOutput),

      ecf,
      ecfMarker: _.filter(ecf, filters.isSpecific),

      pfam,
      pfamMarker: _.filter(pfam, filters.isSpecific),
      pfamHatpase: _.filter(pfam, filters.isHK_CA),
      pfamHiska: _.filter(pfam, filters.isHisKA),
      pfamChemo: _.filter(pfam, filters.isChemotaxis),
      pfamTransmitter: _.filter(pfam, filters.isTransmitter),
      pfamReceiver: _.filter(pfam, filters.isReceiver),
      pfamEcf,
      pfamEcfMarker: _.filter(pfamEcf, filters.isSpecific),
      pfamOutput: _.filter(pfam, filters.isOutput),
    };

    // Create sets of unique domain names for each group for quickly determining
    // membership to a group
    // e.g. [agfam] = Set([RR, HK_CA, HK_CA:1, ...])
    this.sets = {
      // Deprecated: 9 Sep 2018
      hdUnrelatedSignalDomains: pfamHDUnrelatedSignalDomains,
      hkNonSignalDomains: pfamHKNonSignalDomains,
    };

    //      {group name}->{domain name} = signal domain
    // e.g. {agfam}->{RR} = {source: agfam, name: RR, ...}
    this.toSignalDomain = {};
    for (let [groupName, signalDomains] of Object.entries(this.groups)) {
      const nameToSignalDomain = {};
      signalDomains.forEach((signalDomain) => {
        nameToSignalDomain[signalDomain.name] = signalDomain;
      });

      this.toSignalDomain[groupName] = nameToSignalDomain;

      this.sets[groupName] = new Set(signalDomains.map((signalDomain) => signalDomain.name));
    }

    this.signalDomainIdToPfamNames = {};
    this.groups.pfam.forEach((signalDomain) => {
      const {id, name} = signalDomain;
      let set = this.signalDomainIdToPfamNames[id];
      if (!set)
        set = this.signalDomainIdToPfamNames[id] = new Set();

      set.add(name);
    });

    this.signalDomainIdToAgfamNames = {};
    this.groups.agfam.forEach((signalDomain) => {
      const {id, name} = signalDomain;
      let set = this.signalDomainIdToAgfamNames[id];
      if (!set)
        set = this.signalDomainIdToAgfamNames[id] = new Set();

      set.add(name);
    });
  }

  contains(domains, name) {
    if (!domains)
      return false;

    for (let i = 0, z = domains.length; i < z; ++i) {
      if (domains[i].name === name)
        return true;
    }

    return false;
  }

  hasPrimaryMarker(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamMarker) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamMarker);
  }

  hasEcfMarker(bundle) {
    return setContainsSomeDomains(bundle.ecf, this.sets.ecfMarker);
  }

  hasHatpase(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamHatpase) ||
      setContainsSomeDomains(bundle.pfam, this.sets.pfamHiska) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamHatpase);
  }

  hasHpt(bundle) {
    return this.contains(bundle.pfam, 'Hpt');
  }

  hasTransmitter(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamTransmitter) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamTransmitter);
  }

  hasReceiver(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamReceiver) ||
      setContainsSomeDomains(bundle.agfam, this.sets.agfamReceiver);
  }

  hasOutput(bundle) {
    return setContainsSomeDomains(bundle.agfam, this.sets.agfamOutput) ||
      setContainsSomeDomains(bundle.pfam, this.sets.pfamOutput);
  }

  hasPfamEcf(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamEcf);
  }

  hasPfamEcfMarker(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamEcfMarker);
  }

  isChemotaxis(bundle) {
    return setContainsSomeDomains(bundle.pfam, this.sets.pfamChemo) ||
      setContainsSomeDomains(bundle.afam, this.sets.agfamChemo);
  }

  // Deprecated: 9 Sep 2018
  isHdWithUnrelatedDomains(bundle) {
    return this.contains(bundle.pfam, 'HD') &&
      setContainsSomeDomains(bundle.pfam, this.sets.hdUnrelatedSignalDomains);
  }

  isNonSignalingHK(bundle) {
    return this.hasHatpase(bundle) &&
      setContainsSomeDomains(bundle.pfam, this.sets.hkNonSignalDomains);
  }

  findNterminalHatpase(bundle) {
    let hatpase = this.findNterminalKind_(bundle.agfam, this.sets.agfamHatpase);
    hatpase = this.findNterminalKind_(bundle.pfam, this.sets.pfamHatpase, hatpase);
    hatpase = this.findNterminalKind_(bundle.pfam, this.sets.pfamHiska, hatpase);
    return hatpase;
  }

  findNterminalReceiver(bundle) {
    let receiver = this.findNterminalKind_(bundle.agfam, this.sets.agfamReceiver);
    receiver = this.findNterminalKind_(bundle.pfam, this.sets.pfamReceiver, receiver);
    return receiver;
  }

  findNterminalKind_(domains, targetSet, currentMatch = null) {
    for (let domain of domains) {
      if (targetSet.has(domain.name) && (!currentMatch || domain.start < currentMatch.start))
        currentMatch = domain; // eslint-disable-line
    }
    return currentMatch;
  }
};
