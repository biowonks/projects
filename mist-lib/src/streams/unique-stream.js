'use strict';

// Vendor
const through2 = require('through2');

/**
 * If ${idFieldOrFunction} is a string, then identity is established by reading the value of
 * the ${idFieldOrFunction} property of the streamed object. If a function is passed, then the
 * value returned from calling this function with the streamed object establishes its identity.
 *
 * @param {String?|Function?} idFieldOrFunction defaults to 'id'
 * @returns {Stream}
 */
module.exports = function(idFieldOrFunction = 'id') {
  let uniques = new Set(),
    useIdField = typeof idFieldOrFunction === 'string';

  return through2.obj((object, encoding, done) => {
    let value = null;
    try {
      value = useIdField ? object[idFieldOrFunction] : idFieldOrFunction(object);
    }
    catch (error) {
      done(error);
      return;
    }

    if (!uniques.has(value)) {
      uniques.add(value);
      done(null, object);
    }
    else {
      done();
    }
  });
};
