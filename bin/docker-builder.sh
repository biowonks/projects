#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

PROJECT=$1

if [[ -z $PROJECT ]]; then
	echo "Usage: docker-build.sh <project>"
	exit 1
fi

DOCKERFILE="Dockerfile.$PROJECT"
DOCKERIGNORE=".dockerignore.$PROJECT"
if [[ ! -e $DOCKERFILE ]]; then
	echo "No Dockerfile found for $PROJECT"
	exit 1
fi

rm -f .dockerignore
if [[ -e $DOCKERIGNORE ]]; then
	ln -s $DOCKERIGNORE .dockerignore
fi
docker build -t "biowonks/$PROJECT" -f $DOCKERFILE .
