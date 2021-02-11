'use strict';

exports.all = function(stream) {
  exports.writePromise(stream);
  exports.endPromise(stream);
};

exports.writePromise = function(stream) {
  stream.writePromise = function(chunk, encoding, callback) {
    return new Promise((resolve) => {
      if (this.write(chunk, encoding, callback))
        resolve();
      else
        this.once('drain', resolve);
    });
  };
};

exports.endPromise = function(stream) {
  // Once a stream has been finished, there is no way without digging into the private API to
  // know if it has been finished via future calls. The following listens for the finish event and
  // stores its state locally so that no matter how many calls to this function it will always
  // resolve with the proper response.
  let ended = false;
  stream.once('finish', () => {
    ended = true;
  });

  stream.endPromise = function() {
    return new Promise((resolve) => {
      if (ended)
        resolve();
      else
        stream.end(resolve);
    });
  };
};
