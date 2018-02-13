#!/bin/bash
#
# This script is run as the postgres user and no longer as root. Thus
# affects which directories may be written to.

set -e

# Do all work in /tmp
cd /tmp

# ---------------------------------------------------------
# Setup default environment variables
CERT_SUBJ=${CERT_SUBJ:=/C=US/ST=South Carolina/L=Charleston/O=BioWonks/OU=biowonks/CN=local-mistdb.com/emailAddress=biowonks@gmail.com}
DB_USER=${DB_USER:=mist_dev}
DB_NAME=${DB_NAME:=mist_dev}
DB_PASSWORD=${DB_PASSWORD:=$&hxsALC!7_c}

# ---------------------------------------------------------
CONF_FILE=$PGDATA/postgresql.conf

echo "Generating self-signed certificate for 3650 days :)"
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 3650 -nodes -subj "$CERT_SUBJ"

echo "Updating postgresql.conf"
chown postgres:postgres server.key server.crt
chmod 600 server.key server.crt
mv server.key server.crt $PGDATA

echo "ssl = on
ssl_ciphers = 'DEFAULT:!LOW:!EXP:!MD5:@STRENGTH'
ssl_cert_file = '$PGDATA/server.crt'
ssl_key_file = '$PGDATA/server.key'
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
track_activity_query_size = 2048
" >> $CONF_FILE

if [[ -n "$PG_CONF" ]]; then
    echo "$PG_CONF" >> $CONF_FILE
fi

# ---------------------------------------------------------
# Local database setup
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL

-- 1) MiST user (make it look like Heroku)
CREATE ROLE $DB_USER;
ALTER ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD' NOSUPERUSER NOCREATEROLE;

-- 2) MiST database
CREATE DATABASE $DB_NAME OWNER $DB_USER;
REVOKE ALL ON DATABASE $DB_NAME FROM PUBLIC;
GRANT CONNECT ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME;
ALTER SCHEMA public OWNER TO $DB_USER;

-- Enable statement tracking
CREATE EXTENSION pg_stat_statements;
CREATE EXTENSION pg_trgm;

EOSQL

# ---------------------------------------------------------
# Lock down access to local and SSL + password for all other hosts.
PG_HBA_FILE=$PGDATA/pg_hba.conf
echo -e "hostssl	all	all	0.0.0.0/0	md5" > $PG_HBA_FILE
