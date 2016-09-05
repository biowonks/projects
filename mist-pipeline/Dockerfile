FROM biowonks/mist-lib.base

MAINTAINER BioWonks <biowonks@users.noreply.github.com>

RUN apk --no-cache add build-base wget postgresql-client

COPY . /app/mist-pipeline
RUN chown -R biowonks:biowonks /app
USER biowonks
WORKDIR /app/mist-pipeline
RUN npm run setup
