'use strict';

const findSignatureError = (signature) => {
  if (typeof signature != 'object') {
    return 'signature must be an object';
  }

  if (Reflect.has(signature, 'hint') && typeof signature.hint !== 'string') {
    return 'signature.hint must be a string';
  }

  if (Reflect.has(signature, 'isValid') && typeof signature.isValid != 'function') {
    return 'signature.isValid must be a function';
  }

  if (!Reflect.has(signature, 'paramName')) {
    return 'signature.paramName is a required field';
  }

  if (typeof signature.paramName !== 'string') {
    return 'signature.paramName must be a string';
  }

  if (/^\s|\s$/.test(signature.paramName)) {
    return `signature.paramName (${signature.paramName}) must not have any leading or trailing whitespace`;
  }

  if (signature.paramName.length === 0) {
    return 'signature.paramName must not be empty';
  }

  if (Reflect.has(signature, 'transform') && typeof signature.transform !== 'function') {
    return 'signature.transform must be a function';
  }

  return null;
};

module.exports = function(app) {
  const {BadRequestError} = app.get('errors');

  /**
   * Given an array of query parameter signatures, parse / validate / clean the value
   * from the request query object and inject into ${res.locals.cleanQuery} for later
   * consumption.
   *
   * @param {Array} signatures
   * @param {Object} signatures[]
   * @param {any?} signatures[].defaultValue default value to be applied if key does not exist or is empty
   * @param {string?} signatures[].hint optional hint to provide to user when value is invalid
   * @param {Function?} signatures[].isValid method to test if value is valid; should return boolean result
   * @param {string} signatures[].paramName query parameter name
   * @param {Function?} signatures[].transform method to apply to value to produce final result; is not called on default value
   */
  return (signatures) => {
    if (!Array.isArray(signatures)) {
      throw new Error('(parseQueryParams) signatures argument must be an array');
    }

    signatures.forEach((signature, i) => {
      const error = findSignatureError(signature);
      if (error) {
        throw new Error(`(parseQueryParams) invalid signature at index ${i}: ${error}`);
      }
    });

    // Core middleware function
    return function parseQueryParams(req, res, next) {
      const badRequestError = new BadRequestError('Invalid query parameters');
      res.locals.cleanQuery = {};

      signatures.forEach((signature) => {
        const paramPresent = Reflect.has(req.query, signature.paramName);
        const hasDefaultValue = signature.defaultValue !== undefined;
        if (!paramPresent) {
          if (hasDefaultValue) {
            res.locals.cleanQuery[signature.paramName] = signature.defaultValue;
          }
          return;
        }

        const queryParamValue = req.query[signature.paramName];
        const isValid = signature.isValid ? signature.isValid(queryParamValue) : true;
        if (!isValid) {
          badRequestError.addValidationError(signature.paramName, signature.hint);
          return;
        }

        let cleanValue = signature.transform ? signature.transform(queryParamValue) : queryParamValue;
        res.locals.cleanQuery[signature.paramName] = cleanValue;
      });

      const hasError = !!badRequestError.errors;
      const error = hasError ? badRequestError : undefined;
      next(error);
    };
  };
};
