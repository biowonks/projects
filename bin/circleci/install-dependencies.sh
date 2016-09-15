#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

cd $ROOT

for PROJECT in "$@"; do
	echo "====> Installing $PROJECT dependencies"
	docker run --rm -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap /bin/bash -c 'npm prune && npm install'
done
