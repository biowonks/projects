'use strict';

// Local
const HttpStatusCodes = require('../http-status-codes');

module.exports =
class ApiError extends Error {
  constructor(optMessage, optData, optCode) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'ApiError';
    if (optMessage) {
      this.message = optMessage;
    }

    if (optData) {
      this.data = optData;
    }

    this.code = optCode || HttpStatusCodes.InternalServerError;
  }
};
