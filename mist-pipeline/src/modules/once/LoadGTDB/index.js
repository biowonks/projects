'use strict';

// Core
const { createReadStream } = require('fs');
const path = require('path');

// Vendor
const parse = require('csv-parse');

// Local
const { tsvFile2ArrayOfObjects } = require('core-lib/util');
const { asyncBatch } = require('core-lib/generator-util');
const OncePipelineModule = require('lib/OncePipelineModule');
const { readChecksumsFromFile } = require('core-lib/checksum-util');
const {
  checkFileMD5,
  download,
  fileExists,
  mkdir,
  shellCommand,
} = require('mist-lib/mutil');

const GTDB_BASE_URL = 'https://data.gtdb.ecogenomic.org/releases';
const GTDB_MASTER_TABLE_NAME = 'gtdb';
const GTDB_TABLE_PREFIX = 'gtdb_';
const GTDB_MD5SUM_FILENAME = 'MD5SUM';
const BATCH_SIZE = 1000;
const GTDBKeyToTaxonomyName = {
  d: 'superkingdom',
  p: 'phylum',
  c: 'class',
  o: 'orderr', // (2) r's to avoid clashing with database keyword
  f: 'family',
  g: 'genus',
  s: 'species',
};

const getGTDBBaseDirectory = (release) => {
  const integerRelease = release.replace(/\..*$/, '');
  return `${GTDB_BASE_URL}/release${integerRelease}/${release}`;
};

const getGTDBFileURL = (release, filename) => getGTDBBaseDirectory(release) + '/' + filename;

const getFilenames = (release, localDir) => {
  const releaseWithoutDotZero = release.replace(/\.0+$/, '');
  const archaealMetadataFilename = `ar122_metadata_r${releaseWithoutDotZero}.tar.gz`;
  const bacterialMetadataFilename = `bac120_metadata_r${releaseWithoutDotZero}.tar.gz`;
  const spClustersFilename = `sp_clusters_r${releaseWithoutDotZero}.tsv`;

  return {
    archaealMetadata: {
      url: getGTDBFileURL(release, archaealMetadataFilename),
      localPath: path.resolve(localDir, archaealMetadataFilename),
      filename: archaealMetadataFilename,
      extractedLocalPath: path.resolve(localDir, `ar122_metadata_r${releaseWithoutDotZero}.tsv`),
    },
    bacterialMetadata: {
      url: getGTDBFileURL(release, bacterialMetadataFilename),
      localPath: path.resolve(localDir, bacterialMetadataFilename),
      filename: bacterialMetadataFilename,
      extractedLocalPath: path.resolve(localDir, `bac120_metadata_r${releaseWithoutDotZero}.tsv`),
    },
    spClusters: {
      url: getGTDBFileURL(release, `auxillary_files/${spClustersFilename}`),
      localPath: path.resolve(localDir, spClustersFilename),
      filename: spClustersFilename,
    },
  };
};

module.exports =
class LoadGTDB extends OncePipelineModule {
  static description() {
    return 'download and load a specific version of GTDB';
  }

  static moreInfo() {
    return 'Please specify a GTDB version to download via the query\n' +
      'parameter\n' +
      '  -q <release version> (required)';
  }

  constructor(app) {
    super(app);

    this.dataDir_ = path.resolve(__dirname, 'gtdb-data');
    const { Gtdb } = this.models_;
    this.queryGenerator_ = Gtdb.queryGenerator;
    this.gtbbTableName_ = Gtdb.getTableName();
    this.gtdbTableFields_ = Object.keys(Gtdb.rawAttributes);

    // Should be a float (e.g. 95.0 or 86.2)
    this.release_ = (this.query_ || '');
    this.fileNames_ = getFilenames(this.release_, this.dataDir_);
    this.tableName_ = GTDB_TABLE_PREFIX + this.release_.replace('.', 'dot');
    this.gtdbConfig_ = this.config_.gtdb;
  }

  async run() {
    this.throwErrorIfInvalidRelease_();
    await this.downloadDataFiles_();

    const spClustersMap = await this.getSpClustersMap_();
    if (!await this.doesReleaseTableExist_()) {
      await this.createReleaseTable_();
    }
    const { archaealMetadata, bacterialMetadata } = this.fileNames_;
    await this.loadMetadataFile_(archaealMetadata.localPath, spClustersMap);
    await this.loadMetadataFile_(bacterialMetadata.localPath, spClustersMap);
  }

  async downloadDataFiles_() {
    const { created } = await mkdir(this.dataDir_);
    if (created) {
      this.logger_.info(`Created data directory: ${this.dataDir_}`);
    }

    const checksums = await this.getChecksums_();
    await this.downloadAndVerifyGTDBFiles_(checksums);
  }

  async doesReleaseTableExist_() {
    const checkIfReleaseTableExistsSQL = `
      select count(*)
      from information_schema.tables
      where table_name = '${this.tableName_}'
      limit 1
    `;

    const { count } = await this.sequelize_.query(checkIfReleaseTableExistsSQL, {plain: true, raw: true});
    return parseInt(count) === 1;
  }

  createReleaseTable_() {
    this.logger_.info(`Creating GTDB release table ${this.tableName_}`);
    const createTablePartitionSQL = `
      create table ${this.tableName_}
        partition of ${GTDB_MASTER_TABLE_NAME}
        for values in ('${this.release_}')
    `;
    return this.sequelize_.query(createTablePartitionSQL);
  }

  async getChecksums_() {
    const md5file = await this.downloadChecksums_();

    /**
     * Reduce any leading relative path to just the filename itself. For example:
     *
     * auxillary_files/sp_clusters_r95.tsv -> bb9ccf6a8e6898d380b28ffcc1bd0434
     *
     * Becomes
     *
     * sp_clusters_r95.tsv -> bb9ccf6a8e6898d380b28ffcc1bd0434
     */
    const strippedChecksums = {};
    const remoteChecksums = await readChecksumsFromFile(md5file);
    for (const [relativePath, checksum] of Object.entries(remoteChecksums)) {
      const strippedPath = relativePath.replace(/.*\//, '');
      strippedChecksums[strippedPath] = checksum;
    }

    return strippedChecksums;
  }

  async downloadChecksums_() {
    const md5file = path.resolve(this.dataDir_, GTDB_MD5SUM_FILENAME);
    const hasDownloadedChecksums = await fileExists(md5file, true);
    if (!hasDownloadedChecksums) {
      const md5sumUrl = getGTDBFileURL(this.release_, GTDB_MD5SUM_FILENAME);
      this.logger_.info({path: md5file}, 'Downloading checksums');
      await download(md5sumUrl, md5file);
      this.logger_.info('Download finished');
    } else {
      this.logger_.info({path: md5file}, 'Release checksums already downloaded');
    }
    return md5file;
  }

  async downloadAndVerifyGTDBFiles_(checksums) {
    for (const [key, {url, localPath, filename}] of Object.entries(this.fileNames_)) {
      const checksum = checksums[filename];
      if (!checksum) {
        this.logger_.warn({filename}, `Missing checksum for ${key}: ${filename}`);
      }

      const doesFileExist = await fileExists(localPath, true);
      let shouldRedownload = false;
      if (doesFileExist) {
        const isComplete = await checkFileMD5(localPath, checksum);
        shouldRedownload = !isComplete;
        if (shouldRedownload) {
          this.logger_.info({path: localPath}, `${key} existing file checksum mismatch`);
        }
      }
      if (!doesFileExist || shouldRedownload) {
        this.logger_.info({path: localPath}, `Downloading ${filename}`);
        await download(url, localPath);
        this.logger_.info(`Finished downloading ${filename}`);
      } else {
        this.logger_.info({path: localPath}, `${key} file already downloaded`);
      }

      const isValid = await checkFileMD5(localPath, checksum);
      if (!isValid) {
        this.logger_.error({key, localPath}, 'Downloaded incomplete data file. Contents are not valid');
        throw new Error(`Incomplete data for ${key} for ${url}`);
      }
    }
  }

  throwErrorIfInvalidRelease_() {
    const isValidReleaseInput = /^\d+\.\d+$/.test(this.release_);
    if (!isValidReleaseInput) {
      throw new Error(`Invalid or missing GTDB release version specified: ${this.release_}`);
    }
  }

  async getSpClustersMap_() {
    const spClustersRows = await tsvFile2ArrayOfObjects(this.fileNames_.spClusters.localPath);
    const spClustersMap = new Map();
    for (const row of spClustersRows) {
      const representativeAccession = row['representative genome'];

      /* eslint-disable camelcase */
      const ani_circumscription_radius = parseFloat(row['ani circumscription radius']);
      const mean_intra_species_ani = row['mean intra-species ani'];
      const min_intra_species_ani = row['min intra-species ani'];
      const mean_intra_species_af = row['mean intra-species af'];
      const min_intra_species_af = row['min intra-species af'];
      const num_clustered_genomes = parseInt(row['no. clustered genomes']);

      spClustersMap.set(representativeAccession, {
        ani_circumscription_radius,
        mean_intra_species_ani: mean_intra_species_ani === 'N/A' ? null : parseFloat(mean_intra_species_ani),
        min_intra_species_ani: min_intra_species_ani === 'N/A' ? null : parseFloat(min_intra_species_ani),
        mean_intra_species_af: mean_intra_species_af === 'N/A' ? null : parseFloat(mean_intra_species_af),
        min_intra_species_af: min_intra_species_af === 'N/A' ? null : parseFloat(min_intra_species_af),
        num_clustered_genomes,
      });
      /* eslint-enable camelcase */
    }

    return spClustersMap;
  }

  async loadMetadataFile_(gzippedTarballFile, spClustersMap) {
    const pathWithoutExtension = gzippedTarballFile.replace(/\.tar\.gz$/, '');
    const tsvFile = pathWithoutExtension + '.tsv';
    this.logger_.info({gzippedTarballFile}, `Decompressing and extracting metadata file -> ${tsvFile}`);
    await shellCommand(`tar xf ${gzippedTarballFile} -C ${this.dataDir_}`);

    const tsvParser = parse({
      columns: true,
      delimiter: '\t',
      trim: true,
      relax: true,
      skip_empty_lines: true,
      auto_parse: false,
    });

    const pipeline = createReadStream(tsvFile).pipe(tsvParser);

    let totalInserted = 0;
    for await (const batch of asyncBatch(pipeline, BATCH_SIZE)) {
      const dataRows = this.mapTsvToDatabaseColumns_(batch, spClustersMap);
      await this.bulkInsertGTDBRows_(dataRows);
      totalInserted += dataRows.length;
      this.logger_.info(`Bulk inserted another ${dataRows.length} GTDB records (ignoring conflicts); total inserted ${totalInserted}`);
    }
    this.logger_.info(`Finished loading ${totalInserted} GTDB records`);
  }

  mapTsvToDatabaseColumns_(tsvRows, spClustersMap) {
    /* eslint-disable camelcase */
    return tsvRows.map(({
      accession,
      gtdb_genome_representative,
      ncbi_assembly_name,
      ncbi_genbank_assembly_accession,
      gtdb_taxonomy,
      checkm_completeness,
      checkm_contamination,
      checkm_marker_count,
      checkm_marker_lineage,
      checkm_marker_set_count,
      checkm_strain_heterogeneity,
    }) => ({
      release: this.release_,
      accession,
      representative_accession: gtdb_genome_representative,
      is_representative: accession === gtdb_genome_representative,
      ncbi_assembly_name,
      ncbi_genbank_accession: ncbi_genbank_assembly_accession,
      ...this.decodeTaxonomyString_(gtdb_taxonomy),
      ...spClustersMap.get(accession),
      checkm_completeness: parseFloat(checkm_completeness),
      checkm_contamination: parseFloat(checkm_contamination),
      checkm_marker_count: parseInt(checkm_marker_count),
      ...this.decodeCheckMMarkerLineage_(checkm_marker_lineage),
      checkm_marker_set_count: parseInt(checkm_marker_set_count),
      checkm_strain_heterogeneity: parseInt(checkm_strain_heterogeneity),
    }));
    /* eslint-enable camelcase */
  }

  /**
   * Transform the string:
   *
   * d__Archaea;p__Methanobacteriota;c__Methanopyri;o__Methanopyrales;f__Methanopyraceae;g__Methanopyrus;s__Methanopyrus kandleri
   *
   * -->
   *
   * {
   *   superkingdom: 'Archaea',
   *   phylum: 'Methanobacteriota',
   *   class: 'Methanopyri',
   *   orderr: 'Methanopyrales',
   *   family: 'Methanopyraceae',
   *   genus: 'Methanopyrus',
   *   species: 'Methanopyrus kandleri'
   * }
   */
  decodeTaxonomyString_(encodedTaxonomy) {
    return encodedTaxonomy
      .split(';')
      .reduce(
        (acc, taxonString) => {
          const [gtDBKey, taxonomyValue] = taxonString.split('__');
          const column = GTDBKeyToTaxonomyName[gtDBKey];
          if (!column) {
            throw new Error(`Unexpected GTDB column key: ${gtDBKey} for string: ${encodedTaxonomy}`);
          }
          acc[column] = taxonomyValue;
          return acc;
        },
        {},
      );
  }

  decodeCheckMMarkerLineage_(encodedLineage) {
    const matches = /^(\w)__(\S+) \(UID(\d+)/.exec(encodedLineage);
    if (matches) {
      return {
        checkm_marker_taxa_field: GTDBKeyToTaxonomyName[matches[1]] || matches[1],
        checkm_marker_taxa_value: matches[2],
        checkm_marker_uid: parseInt(matches[3]),
      };
    }
  }

  bulkInsertGTDBRows_(dataRows) {
    return this.sequelize_.transaction({
      isolationLevel: 'READ COMMITTED',
    }, async (transaction) => {
      let sql = this.queryGenerator_.bulkInsertQuery(
        this.gtbbTableName_,
        dataRows,
        {fields: this.gtdbTableFields_},
        this.gtdbTableFields_,
      );
      if (sql.endsWith(';')) {
        sql = sql.slice(0, -1);
      }
      sql += ' ON CONFLICT DO NOTHING;';

      await this.sequelize_.query(sql, {raw: true, transaction});
    });
  }
};
