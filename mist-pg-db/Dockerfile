FROM postgres:13.1

ARG GIT_HASH

LABEL BioWonks <biowonks@users.noreply.github.com>
LABEL GIT_HASH=$GIT_HASH

ADD ./postgres-setup.sh /docker-entrypoint-initdb.d/
RUN chmod 755 /docker-entrypoint-initdb.d/postgres-setup.sh
