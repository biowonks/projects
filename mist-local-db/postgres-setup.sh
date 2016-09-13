#!/bin/bash

set -e

# ---------------------------------------------------------
CONF_FILE=$PGDATA/postgresql.conf

echo "Generating self-signed certificate for 3650 days :)"
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 3650 -nodes -subj "/C=US/ST=South Carolina/L=Charleston/O=BioWonks/OU=biowonks/CN=mistdb.com/emailAddress=biowonks@gmail.com"

echo "Updating postgresql.conf"
chown postgres:postgres server.key server.crt
chmod 600 server.key server.crt
mv server.key server.crt $PGDATA

echo "ssl = on" >> $CONF_FILE
echo "ssl_ciphers = 'DEFAULT:!LOW:!EXP:!MD5:@STRENGTH'" >> $CONF_FILE
echo "ssl_cert_file = '$PGDATA/server.crt'" >> $CONF_FILE
echo "ssl_key_file = '$PGDATA/server.key'" >> $CONF_FILE

# ---------------------------------------------------------
# Local database setup
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL

-- 1) MiST dev user (allowed to create databases; otherwise make it look like Heroku)
CREATE ROLE mist_dev;
ALTER ROLE mist_dev WITH LOGIN PASSWORD '$&hxsALC!7_c' NOSUPERUSER CREATEDB NOCREATEROLE;

-- 2) MiST dev database
CREATE DATABASE mist_dev OWNER mist_dev;
REVOKE ALL ON DATABASE mist_dev FROM PUBLIC;
GRANT CONNECT ON DATABASE mist_dev TO mist_dev;
GRANT ALL ON DATABASE mist_dev TO mist_dev;
\c mist_dev;
ALTER SCHEMA public OWNER TO mist_dev;

EOSQL

# ---------------------------------------------------------
# Lock down access to local and SSL + password for all other hosts.
PG_HBA_FILE=$PGDATA/pg_hba.conf
echo -e "local	all	all		trust" > $PG_HBA_FILE
echo -e "hostssl	all	all	0.0.0.0/0	md5" >> $PG_HBA_FILE

# Reload to make the changes effective
/etc/init.d/postgresql reload
