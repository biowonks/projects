'use strict';

module.exports = {
  AGFAM_TOOL_ID: 'agfam2',
  ECF_TOOL_ID: 'ecf1',
  MAX_HYBRID_RECEIVER_START: 60,
  MAX_HISKA_CA_SEPARATION: 60,
  MAX_HK_CA_SEPARATION: 60,
  PFAM_TOOL_ID: 'pfam31',
  THRESHOLD: .001,
};

module.exports.PrimaryRank = {
  ecf: 'ecf',
  ocp: 'ocp',
  tcp: 'tcp',
  chemotaxis: 'chemotaxis',
  other: 'other',
};

module.exports.SecondaryRank = {
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
};

// Deprecated: 9 Sep 2018
module.exports.pfamHDUnrelatedSignalDomains = new Set([
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
]);

module.exports.pfamHKNonSignalDomains = new Set([
  'DNA_gyraseA_C',
  'DNA_gyraseB',
  'DNA_gyraseB_C',
  'Toprim',
  'HSP90',
  'DNA_topoisoIV',
  'DNA_mis_repair',
  'MutL_C',
  'Topo-VIb_trans',
]);
