'use strict';

// Vendor
const streamEach = require('stream-each');

// Local
const AbstractToolRunner = require('./AbstractToolRunner');

/**
 * FastaStreamToolRunner encapsulates the common logic for piping each Aseq as a FASTA sequence to a
 * specific tool stream. Obtaining the relevant tool stream and transferring the result data to the
 * target aseq are delegated to child classes via the toolStream_() and handleResult_() virtual
 * protected methods, respectively.
 */
module.exports =
class FastaStreamToolRunner extends AbstractToolRunner {
  /**
	 * @param {Array.<Aseq>} aseqs
	 * @returns {Promise}
	 */
  onRun_(aseqs) {
    return new Promise(async (resolve, reject) => {
      let i = 0,
        toolStream = this.toolStream_();
      streamEach(toolStream, (result, next) => {
        let aseq = aseqs[i];
        i++;
        this.handleResult_(aseq, result);
        this.tick_();
        next();
      }, (error) => {
        if (error) {
          toolStream.destroy();
          reject(error);
        }
        else {
          resolve(aseqs);
        }
      });

      for (const aseq of aseqs) {
        await toolStream.writePromise(this.getFasta_(aseq));
      }
      toolStream.end();
    });
  }

  // ----------------------------------------------------
  // Virtual protected methods
  /**
	 * Child classes must override this method and are responsible for transferring data from
	 * ${result} to ${aseq}.
	 *
	 * @param {Aseq} aseq
	 * @param {any} result
	 */
  handleResult_(aseq, result) {
    throw new Error('not implemented');
  }

  // eslint-disable-next-line valid-jsdoc
  /**
	 * Child classes must override this method and return a relevant tool stream class to be used
	 * for processing each FASTA sequence.
	 *
	 * @returns {Stream}
	 */
  toolStream_() {
    throw new Error('not implemented');
  }

  /**
	 * Optional override to permit child classes to massage the fasta sequence if needed.
	 *
	 * @param {Aseq} aseq
	 * @returns {string}
	 */
  getFasta_(aseq) {
    return aseq.toFasta();
  }
};
