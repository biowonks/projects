'use strict';

// Vendor
const merge = require('lodash.merge');

// Local
const mistApiConfig = require('../../config');

let config = {
  // Path to the root directory containing all the MiST API routes
  routesPath: mistApiConfig.routing.routesPath,

  // Base url serving up the MiST REST API
  baseUrl: mistApiConfig.server.baseUrl,

  // Array of languages to generate HTML snippets for and how to highlight them. Only the name
  // is required and by default is the language to ${highlightAs} and ${snippet.target}. Modify
  // as needed to produce the desired effect (e.g. bash with curl client)
  languages: [
    {
      name: 'bash',
      highlightAs: 'bash',
      snippets: {
        target: 'shell',
        client: 'curl',
      },
    },
    {
      name: 'node',
      highlightAs: 'javascript',
    },
    {
      name: 'jquery',
      highlightAs: 'javascript',
      snippets: {
        target: 'javascript',
        client: 'jquery',
      },
    },
    {
      name: 'python',
    },
    {
      name: 'ruby',
    },
  ],
  // Array.<String> - these are injected below the TOC
  tocFooters: [],
  // Array.<String> - file paths to either pug templates or HTML files
  //   that ultimately comprise the documentation content. The order listed below
  //   dictates the order they will appear.
  includes: [
    'introduction.pug',
    'partial-responses.pug',
    'linked-models.pug',
    'pagination.pug',
    'rest-api.html', // Dynamically generated via the rest-api gulp task
    'rest-errors.pug',
    'model-structures-intro.pug',
    'model-structures.html', // Dynamically generated via the model-structures gulp task
  ],
  // support client side searching
  search: true,
  highlightTheme: 'agate',
  // If compress is true, minimize / compress output
  compress: true,
};

function normalizeLanguages(languages) {
  languages.forEach((language, i) => {
    if (!language.name) {
      throw new Error(`language configuration (index ${i}) is missing a name`);
    }

    if (!language.highlightAs) {
      language.highlightAs = language.name;
    }

    if (!language.snippets) {
      language.snippets = {};
    }
    if (!language.snippets.target) {
      language.snippets.target = language.name;
    }
  });
}
normalizeLanguages(config.languages);

module.exports = config;
