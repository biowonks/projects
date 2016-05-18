FROM mhart/alpine-node:6.1

MAINTAINER Luke Ulrich <ulrich.luke+ulritech@gmail.com>

ENV HOME=/home/mist3

# shadow: needed for usermod
# git: needed by some npm packages
# build-base: used to compile hmmer3, etc
# wget: used by node source
RUN echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
	apk --update --no-cache add bash git build-base shadow wget && \
	addgroup mist3 && \
	adduser -S -G mist3 -s /bin/false mist3 && \
	usermod -u 1000 mist3

#	groupmod -g 50 mist3

USER mist3
WORKDIR $HOME/api
