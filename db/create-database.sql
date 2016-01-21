-- These commands create a Heroku-like PostgreSQL database.
--
-- Execute as database superuser and update config.js

CREATE ROLE dbuser;
ALTER ROLE dbuser WITH LOGIN PASSWORD 'Put_New_Password_Here!' NOSUPERUSER CREATEDB NOCREATEROLE;

CREATE DATABASE dbname OWNER dbuser;
REVOKE ALL ON DATABASE dbname FROM PUBLIC;
GRANT CONNECT ON DATABASE dbname TO dbuser;
GRANT ALL ON DATABASE dbname TO dbuser;
\c dbname;
ALTER SCHEMA public OWNER TO dbuser;
