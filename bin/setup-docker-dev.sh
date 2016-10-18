#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/..

export LOCAL_USER_ID=$(id -u)
docker-compose build biowonks-dev
docker-compose up -d biowonks-dev

echo '-----------------------------------------------------------'
echo 'biowonks-dev on docker is ready'
echo ''
echo 'To access the docker development environment, please run:'
echo '$ docker attach biowonks-dev'
