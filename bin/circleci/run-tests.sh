#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

cd $ROOT

for PROJECT in "$@"; do
	echo "====> Running $PROJECT tests"
	docker run -e CI=true -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap npm test
	#          ^^^^^^^^^^ inform scripts that we are a CI server
done
