'use strict'

module.exports =
class Domain {
  constructor(start, stop, score, evalue, name, data) {
    this.start_ = start
    this.stop_ = stop
    this.score_ = score
    this.evalue_ = evalue
    this.name_ = name
    this.data_ = data
  }

  static createFromHmmer2(hmmer2) {
    return new Domain(hmmer2.ali_from, hmmer2.ali_to, hmmer2.score, hmmer2.evalue, hmmer2.name, hmmer2)
  }

  static createFromHmmer3(hmmer3) {
    return new Domain(hmmer3.ali_from, hmmer3.ali_to, hmmer3.score, hmmer3.i_evalue, hmmer3.name, hmmer3)
  }

  static toNameSet(domains) {
    return new Set(domains.map((domain) => domain.name_))
  }

  /**
   * @param {Domain[]} domains
   */
  static sortByStart(domains) {
    domains.sort((a, b) => a.start - b.start)
  }

  /**
   * @param {Domain[]} domains
   */
  static sortByEvalue(domains) {
    domains.sort((a, b) => a.evalue_ - b.evalue_)
  }

  toHmmer3() {
    return {
      ali_from: this.start_,
      ali_to: this.stop_,
      score: this.score_,
      i_evalue: this.evalue_,
      name: this.name_,
    }
  }

  get start() {
    return this.start_
  }

  get stop() {
    return this.stop_
  }

  get score() {
    return this.score_
  }

  get evalue() {
    return this.evalue_
  }

  get name() {
    return this.name_
  }
}
