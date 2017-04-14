#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/..

cd $ROOT

BUILD_TARGETS="$@"
if [ -z $BUILD_TARGETS ]; then
	echo "No build targets specified; running all those in build-targets.txt"
	BUILD_TARGETS=$(cat ./build-targets.txt)
fi

for PROJECT in $BUILD_TARGETS; do
	echo "====> Running $PROJECT tests"
	cd $PROJECT
	yarn
	cd ..
	docker run -e CI=true -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap yarn run coverage
	#          ^^^^^^^^^^ inform scripts that we are a CI server; skips installing things like pfam
done
