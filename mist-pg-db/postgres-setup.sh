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
DB_NAME=${DB_NAME:=mist}
DB_ADMIN_USER=${DB_ADMIN_USER:=mist_admin}
DB_ADMIN_PASSWORD=${DB_ADMIN_PASSWORD:=$&hxsALC!7_c}
DB_API_USER=${DB_API_USER:=mist_api}
DB_API_PASSWORD=${DB_API_PASSWORD:=aFqn3fWfKAq}

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
echo "Creating admin user: ${DB_ADMIN_USER}"
echo "Creating API user: ${DB_API_USER}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL

-- 1) MiST user
CREATE ROLE "$DB_ADMIN_USER";
ALTER ROLE "$DB_ADMIN_USER" WITH LOGIN PASSWORD '$DB_ADMIN_PASSWORD' NOSUPERUSER NOCREATEROLE;

CREATE ROLE "$DB_API_USER" NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION VALID UNTIL 'infinity';
ALTER ROLE "$DB_API_USER" WITH LOGIN PASSWORD '$DB_API_PASSWORD';

-- 2) MiST database
CREATE DATABASE "$DB_NAME" OWNER "$DB_ADMIN_USER";
REVOKE ALL ON DATABASE "$DB_NAME" FROM public;
GRANT CONNECT ON DATABASE "$DB_NAME" TO "$DB_ADMIN_USER";
GRANT CONNECT ON DATABASE "$DB_NAME" TO "$DB_API_USER";
GRANT ALL ON DATABASE "$DB_NAME" TO "$DB_ADMIN_USER";
GRANT USAGE ON SCHEMA public TO "$DB_API_USER";
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "$DB_API_USER";
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO "$DB_API_USER";
\c "$DB_NAME";
ALTER SCHEMA public OWNER TO "$DB_ADMIN_USER";

-- Enable statement tracking
CREATE EXTENSION pg_stat_statements;
CREATE EXTENSION pg_trgm;

EOSQL

# ---------------------------------------------------------
# Lock down access to local and SSL + password for all other hosts.
PG_HBA_FILE=$PGDATA/pg_hba.conf
echo -e "hostssl	all	all	0.0.0.0/0	md5" > $PG_HBA_FILE
