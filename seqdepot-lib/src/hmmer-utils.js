'use strict';

exports.mapHmmer3ArrayToHash = (row) => ({
  name: row[0],
  score: row[1],
  bias: row[2],
  c_evalue: row[3],
  i_evalue: row[4],
  hmm_from: row[5],
  hmm_to: row[6],
  hmm_cov: row[7],
  ali_from: row[8],
  ali_to: row[9],
  ali_cov: row[10],
  env_from: row[11],
  env_to: row[12],
  env_cov: row[13],
  acc: row[14],
});
exports.mapHmmer3RowArraysToHashes = (rows) => rows.map(exports.mapHmmer3ArrayToHash);

exports.mapHmmer3HashToArray = (row) => ([
  row.name,
  row.score,
  row.bias,
  row.c_evalue,
  row.i_evalue,
  row.hmm_from,
  row.hmm_to,
  row.hmm_cov,
  row.ali_from,
  row.ali_to,
  row.ali_cov,
  row.env_from,
  row.env_to,
  row.env_cov,
  row.acc,
]);
exports.mapHmmer3RowHashesToArrays = (rows) => rows.map(exports.mapHmmer3HashToArray);
