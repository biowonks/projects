'use strict';

// Core
const assert = require('assert');

// Vendor
const streamEach = require('stream-each');

// Local
const Domain = require('core-lib/bio/Domain');
const RegionContainer = require('core-lib/bio/RegionContainer');
const {
  AGFAM_TOOL_ID,
  ECF_TOOL_ID,
  MAX_HYBRID_RECEIVER_START,
  MAX_HISKA_CA_SEPARATION,
  MAX_HK_CA_SEPARATION,
  PFAM_TOOL_ID,
  THRESHOLD,
  PrimaryRank,
  SecondaryRank,
} = require('mist-lib/services/stp.constants');
const hmmscanStream = require('../../streams/hmmscan-stream');
const StpMatchHelper = require('./StpMatchHelper');
const {
  canClassifyChemotaxis,
  removeInsignificantOverlaps,
  removeOverlappingDomains,
  removeSpecificDomainsOverlappingWith,
  setContainsSomeDomains,
} = require('./stp-utils');

const NUM_CHE_HITS_TO_KEEP = 5;

// TODO: Refactor this service and tool streams (e.g. hmmscan) to mist-lib
module.exports =
class StpService {
  constructor(stpSpec, cheHmmDatabasePath) {
    this.stpiSpec_ = stpSpec;
    this.cheHmmDatabasePath_ = cheHmmDatabasePath;
    this.matchHelper_ = new StpMatchHelper(stpSpec);
  }

  // Must analyze in batches to facilitate chemotaxis classification which
  // requires opening a HMMER3 stream. Because HMMER3 buffers its STDIN
  // it waits until a certain amount of sequence data (1KB?) before it begins
  // processing. This complicates interacting with this stream interface on
  // a sequence by sequence basis. To achieve this effect, a bunch of empty
  // data must be written or the stream closed to flush the input and begin
  // processing.
  //
  // Rather than hack the above, it's simpler to write all relevant sequences
  // to HMMER3 and process in batches.
  async analyze(aseqs) {
    const summaries = aseqs.map((aseq) => this.predict(aseq));
    await this.classify(aseqs, summaries);
    return summaries;
  }

  predict(aseq) {
    const bundle = this.createDomainBundle_(aseq);
    const ranks = this.predictRanks_(bundle);
    if (!ranks)
      return null;

    this.removeNonSignalingDomains_(bundle);
    this.removeOverlappingDomains_(bundle);
    Domain.sortByStart(bundle.pfam);

    const agfamSignalDomains = this.analyzeAgfamDomains_(bundle.agfam, bundle.pfam);
    const pfamSignalDomains = this.analyzePfamDomains_(bundle.pfam);
    const isEcf = ranks[0] === PrimaryRank.ecf;
    const ecfSignalDomains = isEcf ? this.analyzeEcfDomains_(bundle.ecf) : [];

    const signalDomains = [
      ...agfamSignalDomains,
      ...pfamSignalDomains,
      ...ecfSignalDomains,
    ];

    return this.summarize_(signalDomains, ranks);
  }

  async classify(aseqs, summaries) {
    if (aseqs.length !== summaries.length)
      throw new Error(`Unable to run STP classification: unequal number of aseqs (${aseqs.length}) and summaries (${summaries.length})`);

    const cheItems = [];
    summaries.forEach((summary, i) => {
      if (summary && canClassifyChemotaxis(summary.ranks))
        cheItems.push({aseq: aseqs[i], summary});
    });
    if (!cheItems.length)
      return null;

    return new Promise(async (resolve, reject) => {
      const stream = this.createCheToolStream_();
      let i = 0;
      streamEach(stream, (hmmerResult, next) => {
        // The che database contains HMMs for all chemotaxis type proteins.
        // ${allCheHits} will contain all matches even to irrelevant chemotaxis
        // types.
        const allCheHits = hmmerResult.domains;
        const {summary} = cheItems[i];
        i++;

        // Filter out chemotaxis domain matches that do not match the predicted chemotaxis type
        const cheType = summary.ranks[1];
        let hits = [];
        for (let hit of allCheHits) {
          if (hit.name.toLowerCase().startsWith(cheType)) {
            hits.push(hit);
            // Only keep the top X matching hits
            if (hits.length === NUM_CHE_HITS_TO_KEEP)
              break;
          }
        }

        if (hits.length) {
          const bestHit = hits[0];
          const type = bestHit.name.replace(/^\w+-/, '');

          // Modify the summary in-place
          summary.ranks.push(type);
          summary.cheHits = hits;
        }
        next();
      }, (error) => {
        if (error) {
          stream.destroy();
          reject(error);
        }
        else {
          resolve();
        }
      });

      for (const cheItem of cheItems) {
        await stream.writePromise(cheItem.aseq.toFasta());
      }
      stream.end();
    });
  }

  createDomainBundle_(aseq) {
    const bundle = {
      pfam: (aseq[PFAM_TOOL_ID] || []).map(Domain.createFromHmmer3),
      agfam: (aseq[AGFAM_TOOL_ID] || []).map(Domain.createFromHmmer3),
      ecf: (aseq[ECF_TOOL_ID] || []).map(Domain.createFromHmmer2),
    };

    for (let key in bundle)
      Domain.sortByEvalue(bundle[key]);

    removeInsignificantOverlaps(bundle.pfam, THRESHOLD);

    return bundle;
  }

  predictRanks_(bundle) {
    if (this.matchHelper_.hasPrimaryMarker(bundle))
      return this.predictMarkerRanks_(bundle);
    else if (this.matchHelper_.hasEcfMarker(bundle))
      return [PrimaryRank.ecf];

    return null;
  }

  // Assume that bundle has at least one match to a marker
  predictMarkerRanks_(bundle) {
    if (this.matchHelper_.isNonSignalingHK(bundle))
      return null;


    if (this.matchHelper_.isChemotaxis(bundle))
      return this.getChemotaxisRanks_(bundle);

    const tcpRanks = this.getTwoComponentRanks_(bundle);
    if (tcpRanks)
      return tcpRanks;

    // 25 August 2010 - check for ecf domains that overlap with the Sigma70_r2, Sigma70_r4, or Sigma70_r4_2 or pfam ECF
    // (e.g. Sigma70_ECF) signaling marker domains. Give preference to ECF domain prediction in these cases.
    const {pfam} = bundle;
    if (this.matchHelper_.hasEcfMarker(bundle) &&
      (this.matchHelper_.contains(pfam, 'Sigma70_r2') ||
       this.matchHelper_.contains(pfam, 'Sigma70_r4') ||
       this.matchHelper_.contains(pfam, 'Sigma70_r4_2') ||
       this.matchHelper_.hasPfamEcf(bundle)
      ))
      return [PrimaryRank.ecf];
    else if (this.matchHelper_.hasPfamEcfMarker(bundle))
      return [PrimaryRank.ecf];

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
      return [PrimaryRank.ocp];

    return [PrimaryRank.other];
  }

  getChemotaxisRanks_(bundle) {
    const ranks = [PrimaryRank.chemotaxis];
    const {agfam, pfam} = bundle;
    const {signalDomainIdToPfamNames, signalDomainIdToAgfamNames} = this.matchHelper_;

    if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheW)) {
      if (this.matchHelper_.hasTransmitter(bundle) || setContainsSomeDomains(agfam, signalDomainIdToAgfamNames['HK_CA:Che']))
        ranks.push(SecondaryRank.chea);
      else if (this.matchHelper_.hasReceiver(bundle))
        ranks.push(SecondaryRank.chev);
      else
        ranks.push(SecondaryRank.chew);
    }
    else if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheB_methylest)) {
      ranks.push(SecondaryRank.cheb);
    }
    else if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheR) || setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheR_N)) {
      ranks.push(SecondaryRank.cher);
    }
    else if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheD)) {
      ranks.push(SecondaryRank.ched);
    }
    else if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheZ)) {
      ranks.push(SecondaryRank.chez);
    }
    else if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.CheC) && !pfam.map((domain) => domain.name).includes('SpoA')) {
      ranks.push(SecondaryRank.checx);
    }
    else if (setContainsSomeDomains(pfam, signalDomainIdToPfamNames.MCPsignal)) {
      ranks.push(SecondaryRank.mcp);
    }
    else {
      ranks.push(SecondaryRank.other);
    }

    return ranks;
  }

  getTwoComponentRanks_(bundle) {
    const hasTransmitter = this.matchHelper_.hasTransmitter(bundle);
    const hasReceiver = this.matchHelper_.hasReceiver(bundle);
    if (!hasTransmitter && !hasReceiver)
      return null;

    const ranks = [PrimaryRank.tcp];
    const hasHatpase = this.matchHelper_.hasHatpase(bundle);
    if (hasHatpase && hasReceiver) {
      const hybridRank = this.getHybridTwoComponentRank_(bundle);
      assert(hybridRank);
      ranks.push(hybridRank);
    }
    else if (hasHatpase) {
      ranks.push(SecondaryRank.hk);
    }
    else if (hasReceiver) {
      ranks.push(SecondaryRank.rr);
    }
    else {
      ranks.push(SecondaryRank.other);
    }

    return ranks;
  }

  getHybridTwoComponentRank_(bundle) {
    const firstReceiver = this.matchHelper_.findNterminalReceiver(bundle);
    const firstHatpase = this.matchHelper_.findNterminalHatpase(bundle);

    if (!firstReceiver || !firstHatpase)
      return null;

    if (firstReceiver.start < firstHatpase.start) {
      if (firstReceiver.start <= MAX_HYBRID_RECEIVER_START)
        return SecondaryRank.hrr;

      return SecondaryRank.other;
    }

    return SecondaryRank.hhk;
  }

  // --------------------------
  removeNonSignalingDomains_(bundle) {
    bundle.pfam = bundle.pfam.filter((pfamDomain) => {
      return this.matchHelper_.sets.pfam.has(pfamDomain.name);
    });
    // Currenty all agfam domains are involved in signal transduction
  }

  removeOverlappingDomains_(bundle) {
    const container = new RegionContainer();
    removeOverlappingDomains(container, bundle.agfam);
    removeOverlappingDomains(container, bundle.pfam);
  }

  // Assumes array of domains sorted by start
  analyzeAgfamDomains_(agfamDomains, pfamDomains) {
    const signalDomains = [];
    for (let agfamDomain of agfamDomains) {
      const signalDomain = this.matchHelper_.toSignalDomain.agfam[agfamDomain.name];
      if (!signalDomain)
        continue;

      const equivalentPfamNameSet = this.matchHelper_.signalDomainIdToPfamNames[signalDomain.id];
      removeSpecificDomainsOverlappingWith(agfamDomain, equivalentPfamNameSet, pfamDomains);

      // Remove any pfam HisKA domains that are immediately upstream (within ${MAX_HISKA_CA_SEPARATION} aa)
      // of the identified Agfam histidine kinase domain.
      if (signalDomain.id === 'HK_CA' || signalDomain.id === 'HK_CA:Che') {
        for (let i = pfamDomains.length - 1; i >= 0; --i) {
          const pfamDomain = pfamDomains[i];
          const name = pfamDomain.name;
          if (this.matchHelper_.signalDomainIdToPfamNames.HisKA.has(name) &&
              pfamDomain.start < agfamDomain.start &&
              pfamDomain.stop + MAX_HISKA_CA_SEPARATION >= agfamDomain.start
          )
            pfamDomains.splice(i, 1);
        }
      }

      signalDomains.push(signalDomain);
    }

    return signalDomains;
  }

  // Assumes array of domains sorted by start
  analyzePfamDomains_(pfamDomains) {
    const signalDomains = [];
    for (let i = 0, z = pfamDomains.length; i < z; i++) {
      const pfamDomain = pfamDomains[i];
      const signalDomain = this.matchHelper_.toSignalDomain.pfam[pfamDomain.name];
      if (!signalDomain)
        continue;

      signalDomains.push(signalDomain);

      // Special case for HK_CA
      const hasAnotherDomain = i + 1 < z;
      if (signalDomain.id === 'HK_CA' && hasAnotherDomain) {
        // Since there are multiple models for the histidine kinase substructure,
        // Only count pairs of X + HK_CA or cases where the distance between
        // X and HK_CA is <= 60
        //
        // See case study: hiska_hatpase_spacing for details surrounding the use of 60 amino acids
        //
        // Skip over the second HK_CA if they occur in pairs
        const nextDomain = pfamDomains[i + 1];
        const nextSignalDomain = this.matchHelper_.toSignalDomain.pfam[nextDomain.name];
        if (nextSignalDomain &&
            nextSignalDomain.id === 'HK_CA' &&
            pfamDomain.stop + MAX_HK_CA_SEPARATION >= nextDomain.start
        )
          ++i;
      }
    }
    return signalDomains;
  }

  analyzeEcfDomains_(ecfDomains) {
    removeOverlappingDomains(new RegionContainer(), ecfDomains);

    return ecfDomains.map((ecfDomain) => this.matchHelper_.toSignalDomain.ecf[ecfDomain.name])
      .filter((signalDomain) => !!signalDomain);
  }

  summarize_(signalDomains, ranks) {
    // Tally up inputs / outputs / input functions / output functions
    const counts = {};
    const idSets = {
      input: new Set(),
      output: new Set(),
    };
    const functionSets = {
      input: new Set(),
      output: new Set(),
    };
    signalDomains.forEach((signalDomain) => {
      const {id, kind} = signalDomain;
      if (!counts[id])
        counts[id] = 0;
      counts[id]++;

      if (kind !== 'input' && kind !== 'output')
        return;

      idSets[kind].add(id);
      functionSets[kind].add(signalDomain.function);
    });

    // Special case: prioritize ECF over DNA bunding function
    if (ranks[0] === PrimaryRank.ecf)
      functionSets.output.delete('DNA-binding');

    return {
      counts,
      inputs: Array.from(idSets.input).sort(),
      inputFunctions: Array.from(functionSets.input).sort(),
      outputs: Array.from(idSets.output).sort(),
      outputFunctions: Array.from(functionSets.output).sort(),
      ranks,
    };
  }

  createCheToolStream_() {
    /* eslint-disable no-magic-numbers */
    const args = [
      '-E', 1,
      '--domE', 1,
      '--incE', 0.01,
      '--incdomE', 0.03,
    ];
    /* eslint-enable no-magic-numbers */
    return hmmscanStream(this.cheHmmDatabasePath_, args);
  }
};
