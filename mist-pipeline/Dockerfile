FROM mhart/alpine-node:14.15.5

ARG GIT_HASH

LABEL BioWonks <biowonks@users.noreply.github.com>
LABEL GIT_HASH=$GIT_HASH

RUN addgroup biowonks && \
	adduser -S -G biowonks -s /bin/false biowonks && \
	echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
	apk --update --no-cache add git bash build-base openssl postgresql-client python wget rsync && \
	mkdir /app

COPY . /app
WORKDIR /app/mist-pipeline
RUN chown -R biowonks:biowonks /app
USER biowonks
RUN yarn
CMD ["bash", "-c", "bin/pipeline.sh"]
