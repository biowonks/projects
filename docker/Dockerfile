FROM mhart/alpine-node:6.2

MAINTAINER Luke Ulrich <ulrich.luke+ulritech@gmail.com>

ENV HOME=/home/mist

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# shadow: needed for usermod
# git: needed by some npm packages
# build-base: used to compile hmmer3, seg, etc
# wget: used by node source
# su-exec: provides ability to run command as different user
# postgresql-client: so we can use psql from the api container
RUN echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
	apk --update --no-cache add bash git build-base shadow wget su-exec postgresql-client && \

	# Entrypoint configuration
	chmod +x /usr/local/bin/entrypoint.sh && \
	addgroup mist && \
	adduser -S -G mist -s /bin/false mist && \
	usermod -u 1000 mist

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

WORKDIR $HOME/api
