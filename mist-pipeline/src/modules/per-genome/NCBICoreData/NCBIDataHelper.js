'use strict';

// Core
const assert = require('assert');

// Local
const { readChecksumsFromFile } = require('core-lib/checksum-util');
const mutil = require('mist-lib/mutil');

const MAX_DOWNLOAD_TRIES = 10;
const DELAY_BETWEEN_DOWNLOAD_ATTEMPTS_MS = 1000;

/**
 * Helper for downloading genomic data from NCBI. Uses rsync to download files per the NCBI
 * recommendations (https://www.ncbi.nlm.nih.gov/genome/doc/ftpfaq/) and for its ability to
 * perform remote glob matches.
 */
module.exports =
class NCBIDataHelper {
  constructor(fileMapper, logger) {
    this.fileMapper_ = fileMapper;
    this.logger_ = logger;

    // {fileName: md5}
    this.checksums_ = null;
  }

  isDownloaded(sourceType) {
    return this.ensureChecksumsLoaded_()
      .then(() => {
        if (sourceType === 'checksums') {
          return true;
        }

        return this.verify_(sourceType);
      });
  }

  download(sourceType) {
    if (sourceType === 'checksums') {
      return this.ensureChecksumsLoaded_();
    }

    const destFile = this.fileMapper_.pathFor(sourceType);
    return mutil.fileNotEmpty(destFile)
      .then((notEmpty) => {
        if (!notEmpty) {
          return this.downloadAndVerify_(sourceType);
        }

        return this.verify_(sourceType)
          .then((isComplete) => {
            if (isComplete) {
              return null;
            }

            // File exists but is not complete
            this.logger_.info({sourceType, file: destFile}, 'File exists, but is not complete');
            return mutil.unlink(destFile)
              .then(() => {
                this.logger_.info({file: destFile}, 'Removed file');
                return this.downloadAndVerify_(sourceType);
              });
          });
      });
  }

  downloadAndVerify_(sourceType) {
    assert(!!this.checksums_, 'Expected checksums to be defined');

    const url = this.fileMapper_.ncbiHttpsUrlFor(sourceType);
    const destFile = this.fileMapper_.pathFor(sourceType);

    this.logger_.info({sourceType, url, file: destFile}, `Downloading ${sourceType}`);
    return this.downloadFile_(url, destFile)
      .then(() => this.verify_(sourceType))
      .then((isComplete) => {
        if (!isComplete) {
          this.logger_.error({sourceType, url, file: destFile}, 'Downloaded incomplete data file. Contents are not valid');
          throw new Error(`Incomplete data for ${sourceType} from: ${url}`);
        }
      });
  }

  verify_(sourceType) {
    assert(!!this.checksums_, 'Expected checksums to be defined');

    const destFile = this.fileMapper_.pathFor(sourceType);
    return mutil.fileExists(destFile)
      .then((fileExists) => {
        if (!fileExists) {
          return false;
        }

        const fileName = this.fileMapper_.localFileNameFor(sourceType);
        const ncbiFileName = this.fileMapper_.ncbiFileNameFor(sourceType);
        const checksum = this.checksums_[ncbiFileName];
        if (checksum) {
          this.logger_.info({fileName}, `Verifying ${sourceType} file contents`);
          return mutil.checkFileMD5(destFile, checksum);
        }

        // To my knowledge, only the assembly report lacks a checksum
        // For now, assuming that wget would report error if only part of
        // the file is retrieved...
        this.logger_.info({fileName}, `No checksum found, assuming ${sourceType} file contents are valid`);
        return true;
      });
  }

  ensureChecksumsLoaded_() {
    // Case 1: checksums already loaded into memory
    if (this.checksums_) {
      return Promise.resolve(this.checksums_);
    }

    // Case 2: checksums exist on file system but are not yet in memory
    return this.loadChecksums_()
      .catch(() => {
        // Case 3: they may or may not exist, but it was not possible to load them into
        // memory. Re-download
        return this.downloadChecksums_();
      });
  }

  loadChecksums_() {
    const checksumsFile = this.fileMapper_.pathFor('checksums');
    return readChecksumsFromFile(checksumsFile)
      .catch((error) => {
        return mutil.unlink(checksumsFile)
          .finally(() => {
            // Regardless of the success or failure of removing this file
            // re-throw the parsing error
            throw error;
          });
      })
      .then((checksums) => {
        const nChecksums = Object.keys(checksums).length;
        this.logger_.info(`Successfully parsed ${nChecksums} checksums`);
        this.checksums_ = checksums;
        return checksums;
      });
  }

  downloadChecksums_() {
    const url = this.fileMapper_.ncbiHttpsUrlFor('checksums');
    const destFile = this.fileMapper_.pathFor('checksums');

    this.logger_.info({url, destFile}, 'Downloading checksums');
    return this.downloadFile_(url, destFile)
      .then(this.loadChecksums_.bind(this));
  }

  downloadFile_(url, targetFile) {
    let tries = 0;
    const download = () => this.wgetFile_(url, targetFile)
      .catch((error) => {
        ++tries;
        this.logger_.error({error, url, targetFile, tries}, 'Failed to download file. Retrying');
        if (tries >= MAX_DOWNLOAD_TRIES) {
          throw error;
        }
        return mutil.delay(DELAY_BETWEEN_DOWNLOAD_ATTEMPTS_MS).then(download);
      });

    return download();
  }

  rsyncFile_(url, localFile) {
    return mutil.shellCommand(`rsync -q --times "${url}" ${localFile}`);
  }

  wgetFile_(url, targetFile) {
    return mutil.shellCommand(`wget --no-check-certificate -4 --dns-timeout=15 --connect-timeout=15 --read-timeout 30 -t 1 --retry-connrefused -O ${targetFile} "${url}"`);
  }
};
