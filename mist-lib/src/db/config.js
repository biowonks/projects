'use strict';

// Core
const path = require('path');

const DEFAULT_DB_POOL_ACQUIRE_TIMEOUT = 120000;
const DEFAULT_DB_POOL_MAX = 5;
const DEFAULT_DB_POOL_MIN = 0;
const DEFAULT_DB_POOL_IDLE = 10000;
const DEFAULT_DB_POOL_EVICT = 1000;

// Default database configuration.
module.exports = {
  schema: null,
  applicationName: null,

  // NOTE: The DATABASE_URL environment variable if defined will override these values.
  dialect: 'postgres',
  user: 'mist-admin',
  password: 'mist-admin-password',
  host: 'pg-db', // docker-specific
  port: 5432,
  name: 'mist',
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  logging: false,
  pool: {
    acquire: Number(process.env.DB_POOL_ACQUIRE_TIMEOUT) || DEFAULT_DB_POOL_ACQUIRE_TIMEOUT,
    max: Number(process.env.DB_POOL_MAX) || DEFAULT_DB_POOL_MAX,
    min: Number(process.env.DB_POOL_MIN) || DEFAULT_DB_POOL_MIN,
    idle: Number(process.env.DB_POOL_IDLE) || DEFAULT_DB_POOL_IDLE,
    evict: Number(process.env.DB_POOL_EVICT) || DEFAULT_DB_POOL_EVICT,
  },

  models: {
    path: path.resolve(__dirname, '..', 'models'),
  },

  migrations: {
    path: path.resolve(__dirname, 'migrations'),
    pattern: /^\d{4}_[\w-_.]+\.sql$/,
  },

  seqdepot: {
    schema: 'seqdepot',
    migrations: {
      path: path.resolve(__dirname, '..', 'node_modules', 'seqdepot-lib', 'db', 'migrations'),
      pattern: /^\d{4}_[\w-_]+\.sql$/,
      schema: 'seqdepot',
    },

    models: {
      path: path.resolve(__dirname, '..', 'node_modules', 'seqdepot-lib', 'models'),
    },
  },
};
