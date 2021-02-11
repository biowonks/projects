'use strict';

// Vendor
const requestPromise = require('request-promise');

// Local
const mutil = require('../mutil');

// Constants
const kNCBIPartialTaxonomyUrl = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?tool=mistdb&email=biowonks@gmail.com&db=taxonomy&retmode=text&rettype=xml&id=';
const kNCBIRootTaxonomyId = 1; 						// Absolute root taxonomic node defined by NCBI
const kNumberOfWordsInSpecies = 2;
const kDelayTimeBetweenEutilRequest = 334; // No more than three requests per second allowed
const kDelayBetweenFailures = 1000;
const kRetryTimes = 5;

/**
 * Private error used for indicating that a given taxonomic node already exists.
 */
class IntermediateRankExistsError extends Error {}

module.exports =
class TaxonomyService {
  /**
	 * @constructor
	 * @param {Model} taxonomyModel
	 * @param {class} logger
	 */
  constructor(taxonomyModel, logger) {
    this.taxonomyModel_ = taxonomyModel;
    this.logger_ = logger;
  }

  /**
	 * @param {Number} taxonomyId - NCBI taxonomy identifier
	 * @returns {String} - NCBI URL for fetching the XML taxonomy
	 */
  eutilUrl(taxonomyId) {
    return kNCBIPartialTaxonomyUrl + taxonomyId;
  }

  /**
	 * @param {Number} taxonomyId - NCBI taxonomy identifier
	 * @returns {Promise} resolves with an object describing the taxonomy
	 */
  fetchFromNCBI(taxonomyId) {
    const startTime = new Date().getTime();
    if (!/^[1-9]\d*$/.test(taxonomyId)) {
      return Promise.reject(new Error('invalid taxonomy id: must be positive integer'));
    }

    const url = this.eutilUrl(taxonomyId);

    let promise = Promise.reject();
    const tries = Math.max(kRetryTimes, 0) + 1;
    for (let i = 0; i < tries; i++) {
      promise = promise.catch(() => requestPromise(url))
        .catch(() => {
          return mutil.delay(kDelayBetweenFailures)
            .then(() => Promise.reject());
        });
    }

    return promise
      .then(this.parseNCBITaxonomyXML.bind(this))
      .then((result) => {
        const endTime = new Date().getTime();
        const spentTime = endTime - startTime;
        const waitTime = spentTime > kDelayTimeBetweenEutilRequest ? 0 : kDelayTimeBetweenEutilRequest - spentTime;
        return mutil.delay(waitTime)
          .then(() => result);
      });
  }

  /**
	 * If the node corresponding to ${taxonomyId} does not exist, fetch the full taxonomy
	 * information from NCBI and upsert any missing taxonomic nodes.
	 *
	 * @param {Number} taxonomyId - NCBI taxonomy identifier
	 * @returns {Promise} taxonomyObject with id, name, rank, parent
	 */
  async updateTaxonomy(taxonomyId) {
    const localRawTaxonomy = await this.fetchLocal_(taxonomyId);
    if (localRawTaxonomy) {
      return localRawTaxonomy;
    }
    const nodeExists = await this.nodeExists_(taxonomyId);
    if (nodeExists) {
      this.logger_.info(`Node exists: ${taxonomyId}`);
      return this.fetchLocal_(taxonomyId);
    }

    const rawTaxonomy = await this.fetchFromNCBI(taxonomyId);
    let reversedLineage = rawTaxonomy.lineage.slice().reverse();

    for (const node of reversedLineage) {
      try {
        await this.insertNodeIfNew_(node);
      } catch (error) {
        if (error instanceof IntermediateRankExistsError) {
          break;
        }
      }
    }
    return rawTaxonomy;
  }

  /**
	 * @param {String} xml - NCBI Taxonomy XML report
	 * @returns {Promise.<Object>} - reshaped taxonomy
	 */
  async parseNCBITaxonomyXML(xml) {
    const ncbiTaxonomy = await mutil.xmlToJs(xml);
    return this.reshapeNCBITaxonomy(ncbiTaxonomy);
  }

  /**
	 * @param {Object} ncbiTaxonomy object representation of the NCBI taxonomy XML
	 * @returns {Object}
	 * 	{
	 *	  lineage: [ // Full lineage list with node id, name and rank
	 *	    {
	 *        id: 131567,
	 *        name: 'cellular organisms',
	 *        rank: 'no rank'
	 *      },
	 *      {
	 *        id: 2,
	 *        name: 'Bacteria',
	 *        rank: 'superkingdom'
	 *      },
	 *      ...
	 *    ],
	 *    superkingdom,
	 *    kingdom,
	 *    phylum,
	 *    class,
	 *    order,
	 *    family,
	 *    genus,
	 *    species,
	 *    strain
	 *	}
	 */
  reshapeNCBITaxonomy(ncbiTaxonomy) {
    const taxon = ncbiTaxonomy.TaxaSet.Taxon[0];
    const result = {
      taxid: Number(taxon.TaxId[0]),
      organism: taxon.ScientificName[0],
      lineage: [],
      superkingdom: null,
      kingdom: null,
      phylum: null,
      class: null,
      order: null,
      family: null,
      genus: null,
      species: null,
      strain: null,
    };
    const currentNode = {
      id: result.taxid,
      parent_taxonomy_id: Number(taxon.ParentTaxId[0]),
      name: taxon.ScientificName[0],
      rank: taxon.Rank[0],
    };
    const rankObjects = taxon.LineageEx[0].Taxon;

    rankObjects.forEach((rankObject, i) => {
      const node = {
        id: Number(rankObject.TaxId[0]),
        parent_taxonomy_id: i > 0 ? result.lineage[i - 1].id : kNCBIRootTaxonomyId,
        name: rankObject.ScientificName[0],
        rank: rankObject.Rank[0],
      };
      result.lineage.push(node);
      if (result[node.rank] === null)
        result[node.rank] = node.name;
    });

    result.lineage.push(currentNode);
    if (result[currentNode.rank] === null) {
      result[currentNode.rank] = currentNode.name;
    }

    if (result.species) {
      let strain = result.organism
        .split(/\s+/g)
        .slice(kNumberOfWordsInSpecies)
        .join(' ')
        .trim();

      // It is quite possible that strain will equal the empty string. The following test
      // avoids saving this to the database (strain will be null)
      if (strain) {
        result.strain = strain;
      }
    }

    return result;
  }

  /**
	 * @param {Number} taxonomyId - NCBI taxonomy id
	 * @returns {List} genomic children of given taxonomy id
	 */
  async fetchChildren(taxonomyId, options) {
    let taxonomyTableName = this.taxonomyModel_.getTableName(),
      sql = '';
    if (options.isImmediate) {
      if (options.isLeafOnly)
        sql = `select a.* from ${taxonomyTableName} a join genomes b ON (a.id = b.taxonomy_id) where parent_taxonomy_id = ?`;
      else
        sql = `select * from ${taxonomyTableName} where parent_taxonomy_id = ?`;
    }
    else {
      sql = `with recursive tree_nodes as (
	select * from ${taxonomyTableName} where id = ?
	union all
	select a.* from ${taxonomyTableName} a, tree_nodes where tree_nodes.id = a.parent_taxonomy_id
)`;
      if (options.isLeafOnly)
        sql += 'select a.* from tree_nodes a join genomes b ON (a.id = b.taxonomy_id)';
      else
        sql += 'select * from tree_nodes';
    }

    const rows = await this.taxonomyModel_.sequelize.query(sql, {
      replacements: [taxonomyId],
      type: this.taxonomyModel_.sequelize.QueryTypes.SELECT,
    });

    return rows.length ? rows : null;
  }

  /**
	 * @param {Number} taxonomyId - NCBI taxonomy id
	 * @returns {List} lineage of taxonomic nodes - objects
	 */
  async fetchLineage(taxonomyId) {
    const result = await this.fetchLocal_(taxonomyId);
    return Boolean(result) ? result.lineage.slice().reverse() : [];
  }

  // ----------------------------------------------------
  // Private methods
  /**
	 * @param {Number} taxonomyId - NCBI taxonomy id
	 * @param {Transaction} [transaction = null] - Sequelize transaction object
	 * @returns {Promise} with resolve as boolean true if the give node Taxonomy ID exists in the taxonomy table
	 */
  async nodeExists_(taxonomyId, transaction = null) {
    const taxonomyRow = await this.taxonomyModel_.findOne({
      where: {
        id: taxonomyId,
      },
      transaction,
    });
    return Boolean(taxonomyRow);
  }

  /**
	 * Inserts ${taxonomyRecord} if it does not already exist in the database. If it does exist,
	 * throws an IntermediateRankExistsError.
	 *
	 * @param {Object} taxonomyRecord
	 * @param {Number} taxonomyRecord.id - NCBI taxonomy id
	 * @param {Number} taxonomyRecord.parent_taxonomy_id - parent NCBI taxonomy id
	 * @param {String} taxonomyRecord.name
	 * @param {String} taxonomyRecord.rank
	 * @returns {Promise}
	 */
  insertNodeIfNew_(taxonomyRecord) {
    return this.taxonomyModel_.sequelize.transaction({
      isolationLevel: 'READ COMMITTED',
    }, async (transaction) => {
      const nodeExists = await this.nodeExists_(taxonomyRecord.id, transaction);
      // No need iterate insertion check for parents. If the node already exists, its parents must exist as well.
      if (nodeExists) {
        throw new IntermediateRankExistsError();
      }

      const taxonomy = await this.taxonomyModel_.create(taxonomyRecord, {transaction});
      if (this.logger_) {
        this.logger_.info(taxonomy.get(), `Inserted new taxonomy node: ${taxonomy.name} with id: ${taxonomy.id}`);
      }
    });
  }

  async fetchLocal_(taxonomyId) {
    let taxonomyTableName = this.taxonomyModel_.getTableName(),
      sql = `with recursive tree_nodes as (
    select * from ${taxonomyTableName} where id = ?
    union all
    select a.* from ${taxonomyTableName} a, tree_nodes where tree_nodes.parent_taxonomy_id = a.id
)
select * from tree_nodes`;

    const rows = await this.taxonomyModel_.sequelize.query(sql, {
      replacements: [taxonomyId],
      type: this.taxonomyModel_.sequelize.QueryTypes.SELECT,
    });
    if (!rows.length) {
      return null;
    }

    const result = {
      lineage: rows,
      superkingdom: null,
      kingdom: null,
      phylum: null,
      class: null,
      order: null,
      family: null,
      genus: null,
      species: null,
      strain: null,
    };

    for (const row of rows) {
      if (Reflect.has(result, row.rank)) {
        result[row.rank] = row.name;
      }
    }

    return result;
  }
};
