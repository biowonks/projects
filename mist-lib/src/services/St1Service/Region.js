'use strict'

// Core
const assert = require('assert')

module.exports =
class Region {
  constructor(start, stop, optData) {
    this.start_ = start
    this.stop_ = stop
    this.data_ = optData

    assert(start >= 1, 'new start value must be positive')
    assert(start <= stop, 'start must be less than or equal to stop')
  }

  static createFromDomain(domain) {
    return new Region(domain.start, domain.stop, domain)
  }

  get data() {
    return this.data_
  }

  findOverlap(region, tolerance = 0) {
    if (!region) {
      return null
    }

    let amount = 0
    let type = 0

    // Case 1:
    //               -----
    //               |||||
    // query: --------------------------
    if (this.start_ >= region.start_ &&
      this.start_ <= region.stop_ &&
      this.stop_ >= region.start_ &&
      this.stop_ <= region.stop_)
    {
      if (!tolerance || this.length > tolerance) {
        type = 1;
        amount = this.length;
      }
    }
    // Case 2:
    //         ------------------------------
    //                  |||||
    // query:           -----
    else if (region.start_ >= this.start_ &&
      region.start_ <= this.stop_ &&
      region.stop_ >= this.start_ &&
      region.stop_ <= this.stop_)
    {
      if (!tolerance || region.length > tolerance) {
        type = 2;
        amount = region.length;
      }
    }
    // Case 3:
    //          ----------------
    //                 |||||||||
    // query:          ------------------------
    else if (this.stop_ >= region.start_ &&
      this.stop_ <= region.stop_ &&
      this.start_ < region.start_)
    {
      if (!tolerance || this.stop_ - region.start_ + 1 > tolerance)
      {
        type = 3;
        amount = this.stop_ - region.start_ + 1;
      }
    }
    // Case 4:
    //                       -------------------------------
    //                       ||||||||||||||||||
    // query: ---------------------------------
    else if (this.start_ >= region.start_ &&
      this.start_ <= region.stop_ &&
      this.stop_ > region.stop_)
    {
      if (!tolerance || region.stop_ - this.start_ + 1 > tolerance)
      {
        type = 4;
        amount = region.stop_ - this.start_ + 1;
      }
    }

    if (!amount) {
      return null
    }

    return {
      amount,
      // Number of non-overlapping characters in query
      queryDifference: region.length - amount,
      // Perecentage of query overlapping
      queryPercent: amount / region.length,
      region: this,
      // Number of non-overlapping characters in subject
      subjectDifference: this.length - amount,
      // Perecentage of subject overlapping
      subjectPercent: amount / this.length,
      type,
    }
  }

  get length() {
    return this.stop_ - this.start_ + 1
  }

  get start() {
    return this.start_
  }

  set start(newStart) {
    assert(newStart >= 1, 'new start value must be positive')
    assert(newStart <= this.stop_, 'new start value must be less than or equal to stop')
    this.start_ = newStart
  }

  get stop() {
    return this.stop_
  }

  set stop(newStop) {
    assert(newStop >= this.start_, 'new stop value must be greater than or equal to start')
    this.stop_ = newStop
  }
}
