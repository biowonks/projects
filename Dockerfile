FROM debian:jessie

MAINTAINER Luke Ulrich <ulrich.luke+ulritech@gmail.com>

ENV HOME=/home/mist3

ENV GOSU_VERSION 1.7
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN set -x \
    && apt-get update && apt-get install -y --no-install-recommends ca-certificates wget build-essential git && rm -rf /var/lib/apt/lists/* \
    && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture)" \
    && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture).asc" \
    && export GNUPGHOME="$(mktemp -d)" \
    && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
    && rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true \

	&& useradd -u 1000 -m -s /bin/bash mist3 \
	&& chmod +x /usr/local/bin/entrypoint.sh \

    && apt-get purge -y --auto-remove ca-certificates

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

WORKDIR $HOME/api
