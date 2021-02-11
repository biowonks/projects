FROM mhart/alpine-node:14.15.5

ARG GIT_HASH

LABEL BioWonks <biowonks@users.noreply.github.com>
LABEL GIT_HASH=$GIT_HASH

RUN addgroup biowonks && \
	adduser -S -G biowonks -s /bin/false biowonks && \
	echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
	apk --update --no-cache add git bash build-base openssl postgresql-client python && \
	mkdir /app

ENV HOME=/app
ENV NODE_ENV=production

COPY . /app
WORKDIR /app/mist-api
RUN chown -R biowonks:biowonks /app
USER biowonks

# Because building the docs relies on imports from core-lib,
# seqdepot-lib, and mist-lib, the following hack ensures all
# those packages are present before attempting the build.
# Definitely not ideal.
RUN cd /app/core-lib && yarn && \
	cd /app/seqdepot-lib && yarn && \
	cd /app/mist-lib && yarn && \
	cd /app/mist-api && yarn
CMD ["yarn", "start"]
