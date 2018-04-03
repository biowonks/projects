FROM postgres:10.3

LABEL BioWonks <biowonks@users.noreply.github.com>

ADD ./postgres-setup.sh /docker-entrypoint-initdb.d/
RUN chmod 755 /docker-entrypoint-initdb.d/postgres-setup.sh
