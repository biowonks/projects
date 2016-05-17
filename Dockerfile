FROM mhart/alpine-node:6.1

MAINTAINER Luke Ulrich <ulrich.luke+ulritech@gmail.com>

ENV HOME=/home/mist3

RUN apk add --update bash build-base git wget && \
	addgroup mist3 && \
	adduser -S -G mist3 -s /bin/false mist3

USER mist3
WORKDIR $HOME/api
