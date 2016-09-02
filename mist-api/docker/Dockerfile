# References:
# https://denibertovic.com/posts/handling-permissions-with-docker-volumes/ (used su-exec instead
# of gosu)

FROM biowonks/base-image

MAINTAINER Luke Ulrich <ulrich.luke+ulritech@gmail.com>

ENV HOME=/home/biowonk

COPY child-entrypoint.sh /usr/local/bin/child-entrypoint.sh

# git: needed by some npm packages
# build-base: used to compile hmmer3, seg, etc
# wget: used by node source
# postgresql-client: so we can use psql from the api container
RUN apk --no-cache add git build-base wget postgresql-client && \
	chmod +x /usr/local/bin/child-entrypoint.sh

WORKDIR $HOME/mist-api
