'use strict';

// Core
const assert = require('assert');

/**
 * Specialized tree node class for dealing with GenBank keywords and any sub-keywords. Originally,
 * a private class of GenbankReaderStream.
 *
 * Maintains a set of lines for a specific keyword and any sub keywords.
 */
module.exports =
class GenbankKeywordNode {
  /**
	 * If optLine is not null, then adds this line (even if the empty string)
	 * to the internal lines array.
	 *
	 * @constructor
	 * @param {string} keyword GenBank keyword
	 * @param {string?} optLine defaults to null
	 */
  constructor(keyword, optLine = null) {
    assert(optLine === null || typeof optLine === 'string', 'optLine argument must be falsy or a string');

    this.keyword_ = keyword;
    this.level_ = this.calcLevel_();
    this.parent_ = null;
    this.children_ = new Map();
    this.lines_ = [];
    if (optLine !== null)
      this.lines_.push(optLine);
  }

  /**
	 * @param {GenbankKeywordNode} child
	 */
  addChild(child) {
    assert(child !== this, 'child node is not allowed to be a child of itself');
    assert(child.parent_ === null, 'child node is already associated with a parent');
    assert(this.level() + 1 === child.level(), 'child level is not one compatible with this node\'s level');
    assert(!this.child(child.keyword()), 'multiple children with the same keyword is not allowed');
    child.parent_ = this;
    this.children_.set(child.keyword_, child);
  }

  /**
	 * @param {string} keyword
	 * @returns {GenbankKeywordNode}
	 */
  child(keyword) {
    return this.children_.get(keyword);
  }

  /**
	 * @returns {boolean}
	 */
  hasChildren() {
    return this.children_.size > 0;
  }

  /**
	 * @returns {string} all lines joined by a single space
	 */
  joinedLines() {
    return this.lines_.join(' ');
  }

  /**
	 * @returns {string}
	 */
  keyword() {
    return this.keyword_;
  }

  /**
	 * The level of a keyword depends on the number of spaces preceding the keyword itself. As of
	 * June 2016, three levels existed:
	 *
	 * 1) no spaces
	 * 2) 2 spaces
	 * 3) 3 spaces
	 *
	 * @returns {number} 0-based level of this keyword
	 */
  level() {
    return this.level_;
  }

  /**
	 * @returns {Array.<string>}
	 */
  lines() {
    return this.lines_;
  }

  /**
	 * @returns {GenbankKeywordNode}
	 */
  parent() {
    return this.parent_;
  }

  /**
	 * @param {string} line
	 */
  pushLine(line) {
    this.lines_.push(line);
  }

  // ----------------------------------------------------
  // Private methods
  calcLevel_() {
    let nSpaces = 0;
    for (let i = 0, z = this.keyword_.length; i < z; i++) {
      if (this.keyword_[i] === ' ')
        nSpaces++;
      else
        break;
    }

    /* eslint-disable no-magic-numbers */
    switch (nSpaces) {
      case 0:
        return 0;
      case 2:
        return 1;
      case 3:
        return 2;

      default:
        throw new Error(`Keyword ${this.keyword_} must begin with 0, 2, or 3 spaces`);
    }
    /* eslint-eable no-magic-numbers */
  }
};
