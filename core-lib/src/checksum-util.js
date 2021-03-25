'use strict';

// Core
const { createReadStream } = require('fs');

// Vendor
const split = require('split');

exports.readChecksumsFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const lineStream = createReadStream(file)
      .pipe(split());
    const checksums = {};
    let invalidChecksumLine = null;

    lineStream
      .on('error', reject)
      .on('data', (line) => {
        const checksum = exports.parseChecksumLine(line);
        if (checksum) {
          const { md5, fileName } = checksum;
          checksums[fileName] = md5;
        } else if (!invalidChecksumLine && /\S/.test(line)) {
          invalidChecksumLine = line;
        }
      })
      .on('end', () => {
        if (!invalidChecksumLine) {
          resolve(checksums);
        } else {
          reject(new Error(`Invalid checksum line: ${invalidChecksumLine}`));
        }
      });
  });
};

exports.parseChecksumLine = (line) => {
  const matches = /^([a-f0-9]{32})\s+(?:\.\/)?(\S+)/i.exec(line);
  if (!matches) {
    return null;
  }

  const md5 = matches[1];
  const fileName = matches[2];
  return {md5, fileName};
};
