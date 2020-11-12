/* eslint-disable valid-jsdoc */

'use strict';

// Core
const assert = require('assert');

module.exports =
class AbstractLocation {
  /**
	 * Returns the total length of this location relative to ${seqLength} (which is necessary for
	 * circular sequences).
	 *
	 * @param {Boolean} isCircular
	 * @param {Number} seqLength
	 * @returns {Number}
	 */
  length(isCircular, seqLength) {
    let lowerBound = this.lowerBound(),
      upperBound = this.upperBound();

    assert(typeof seqLength === 'number', 'seqLength is not defined');
    assert(lowerBound <= seqLength, 'lower bound exceeds sequence length');
    assert(upperBound <= seqLength, 'upper bound exceeds sequence length');
    assert(isCircular || lowerBound <= upperBound, `lower bound ${lowerBound} exceeds upper bound ${upperBound} on non-circular sequence`);

    if (!isCircular || lowerBound <= upperBound)
      return upperBound - lowerBound + 1;

    return (seqLength - lowerBound + 1) + (upperBound - 1 + 1);
  }

  /**
	 * Returns the most definite, absolute lower bound this location occupies.
	 *
	 * @returns {Number}
	 */
  lowerBound() {
    throw new Error('not implemented');
  }

  /**
	 * Returns the most definite, absolute upper bound this location occupies.
	 *
	 * @returns {Number}
	 */
  upperBound() {
    throw new Error('not implemented');
  }

  /**
	 * @param {AbstractLocation} otherLocation
	 * @param {Boolean} isCircular
	 * @param {Number} seqLength
	 * @returns {Boolean} - true if ${otherLocation} and this location are overlapping by one or more positions; false otherwise
	 */
  overlaps(otherLocation, isCircular, seqLength) {
    let ourLowerBound = this.lowerBound(),
      ourUpperBound = this.upperBound(),
      ourSegments = [],
      otherLowerBound = otherLocation.lowerBound(),
      otherUpperBound = otherLocation.upperBound(),
      otherSegments = [];

    if (isCircular) {
      let ourWraps = ourLowerBound > ourUpperBound;
      if (ourWraps) {
        ourSegments.push([ourLowerBound, seqLength]);
        ourSegments.push([1, ourUpperBound]);
      }
      else {
        ourSegments.push([ourLowerBound, ourUpperBound]);
      }

      let otherWraps = otherLowerBound > otherUpperBound;
      if (otherWraps) {
        otherSegments.push([otherLowerBound, seqLength]);
        otherSegments.push([1, otherUpperBound]);
      }
      else {
        otherSegments.push([otherLowerBound, otherUpperBound]);
      }
    }
    else {
      assert(ourLowerBound <= ourUpperBound, `this lower bound, ${ourLowerBound}, exceeds this upper bound, ${ourUpperBound}, on non-circular sequence`);
      assert(otherLowerBound <= otherUpperBound, `other lower bound, ${otherLowerBound}, exceeds other upper bound, ${otherUpperBound}, on non-circular sequence`);

      ourSegments.push([ourLowerBound, ourUpperBound]);
      otherSegments.push([otherLowerBound, otherUpperBound]);
    }

    for (let ourSegment of ourSegments) {
      let ourStart = ourSegment[0],
        ourStop = ourSegment[1];
      for (let otherSegment of otherSegments) {
        let otherStart = otherSegment[0],
          otherStop = otherSegment[1];

        // eslint-disable-next-line curly
        if ((otherStart >= ourStart && otherStart <= ourStop) ||
					(otherStop >= ourStart && otherStop <= ourStop) ||
					(ourStart >= otherStart && ourStart <= otherStop) ||
					(ourStop >= otherStart && ourStop <= otherStop)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
	 * @returns {String}
	 */
  strand() {
    throw new Error('not implemented');
  }

  /**
	 * @param {Seq} seq
	 * @returns {Seq}
	 */
  transcriptFrom(seq) {
    throw new Error('not implemented');
  }
};
