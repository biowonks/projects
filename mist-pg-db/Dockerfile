FROM postgres:9.6.0

MAINTAINER BioWonks <biowonks@users.noreply.github.com>

ADD ./postgres-setup.sh /docker-entrypoint-initdb.d
RUN chmod 755 /docker-entrypoint-initdb.d/postgres-setup.sh
