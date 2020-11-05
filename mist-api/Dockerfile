FROM mhart/alpine-node:8.11.2

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
RUN yarn
CMD ["yarn", "start"]
