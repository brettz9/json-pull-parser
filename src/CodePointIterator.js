/* eslint-disable no-empty-function, class-methods-use-this -- Not complete */
/**
 * @ignore
 */
class CodePointIterator {
  /**
  * @param {string} source
  * @returns {void}
  */
  constructor (source) {
    this.s = source;
    this.f = 0;
    this.l = Math.trunc(source.length);
    this.cc = 0;
  }

  /**
   * @returns {boolean}
   */
  next () {
    if (this.f >= this.l) return false;
    this.cc = this.s.charCodeAt(this.f++);
    return true;
  }

  /**
   * @returns {Integer}
   */
  code () {
    return this.cc;
  }

  /**
   * @param {Integer} code
   * @returns {void}
   */
  expect (code) {
  }
}

export default CodePointIterator;
