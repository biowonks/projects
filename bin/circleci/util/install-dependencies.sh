#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../../..

for PROJECT in "$@"; do
	echo "====> Installing $PROJECT dependencies"
	docker run -e CI=true -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap /bin/bash -c 'npm prune && npm install'
	#          ^^^^^^^^^^ inform scripts that we are a CI server

	if [[ $PROJECT = 'mist-api' ]]; then
		echo "====> Installing $PROJECT docs dependencies (not on docker)"
		pushd $ROOT/$PROJECT/src/docs
		npm prune && npm install
		popd
	fi
done
