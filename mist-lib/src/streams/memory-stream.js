'use strict';

// Core
const stream = require('stream');

/**
 * Nothing is streamed if ${input} is undefined, null, or empty. Output encoding defaults to uft8
 * unless specified otherwise.
 */
class MemoryStream extends stream.Readable {
  constructor(input, options = {}) {
    if (!options.encoding)
      options.encoding = 'utf8';
    super(options);
    this.input_ = input;
    this.length_ = input ? input.length : 0;
    this.offset_ = 0;
  }

  _read(size) {
    // Case 1: falsy string
    if (!this.input_) {
      this.push(null);
      return;
    }

    // Case 2: requesting fewer bytes than the string contains
    if (size < this.length_) {
      let substring = this.input_.substr(this.offset_, size);
      this.offset_ += size;
      this.push(substring);
      if (this.offset_ >= this.length_)
        this.push(null);
    }
    // Case 3: requesting entire input
    else {
      this.push(this.input_);
      this.push(null);
    }
  }
}

module.exports = function(input, options) {
  return new MemoryStream(input, options);
};
