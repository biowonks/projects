#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../../..

for PROJECT in "$@"; do
	echo "====> Installing $PROJECT dependencies"
	docker run -e TMHMM2_SECURE_URL=$TMHMM2_SECURE_URL \
			   -e CI=true -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap /bin/bash -c yarn
	#          ^^^^^^^^^^ inform scripts that we are a CI server
done
