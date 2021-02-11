'use strict';

// Core
const assert = require('assert');

module.exports =
class RegionContainer {
  constructor() {
    this.regions_ = [];
  }

  add(region) {
    assert(this.regions_.indexOf(region) === -1);
    this.regions_.push(region);
    return this;
  }

  get regions() {
    return this.regions_;
  }

  findOverlaps(queryRegion, tolerance = 0) {
    return this.regions_.map((region) => region.findOverlap(queryRegion, tolerance))
      .filter((overlap) => !!overlap);
  }
};
