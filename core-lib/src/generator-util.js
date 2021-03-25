'use strict';

/**
 * @param {Array.<any>} array
 * @param {Number} size - maximum number of elements to yield
 * @yields {Array.<any>}
 */
exports.batch = function *(array, size) {
  if (!size || size < 0) {
    return;
  }

  let i = 0;
  while (i < array.length) {
    let slice = array.slice(i, i + size);
    i += size;
    yield slice;
  }
};

exports.asyncBatch = async function *(iterator, size) {
  if (!size || size < 0) {
    return;
  }

  let batch = [];
  for await (const item of iterator) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length) {
    yield batch;
  }
};
