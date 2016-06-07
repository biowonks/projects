FROM mhart/alpine-node:6.2

MAINTAINER Luke Ulrich <ulrich.luke+ulritech@gmail.com>

ENV HOME=/home/mist3
ENV GOSU_VERSION 1.7

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# shadow: needed for usermod
# git: needed by some npm packages
# build-base: used to compile hmmer3, etc
# wget: used by node source
RUN echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
	apk --update --no-cache add bash git build-base shadow wget && \
	apk add --virtual .gos-deps dpkg gnupg openssl && \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture)" && \
    # && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture).asc"
# RUN export GNUPGHOME="$(mktemp -d)" \
    # && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    # && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
    # && rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc \
# RUN chmod +x /usr/local/bin/gosu \
#     && gosu nobody true \
#     && apk del .gosu-deps && \

	chmod +x /usr/local/bin/gosu && \
	chmod +x /usr/local/bin/entrypoint.sh && \
	addgroup mist3 && \
	adduser -S -G mist3 -s /bin/false mist3 && \
	usermod -u 1000 mist3

#	groupmod -g 50 mist3

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

WORKDIR $HOME/api
