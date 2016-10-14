#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../../..

cd $ROOT

for PROJECT in "$@"; do
	echo "====> Running $PROJECT tests"
	docker run -e CI=true -e MOCHA_REPORTER=mocha-circleci-reporter -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap npm run coverage
	#          ^^^^^^^^^^ inform scripts that we are a CI server

	echo "      - Copying coverage report to artifacts"
	mkdir -p $CIRCLE_ARTIFACTS/coverage/$PROJECT
	cp -r $ROOT/$PROJECT/testing/coverage/lcov-report/* $CIRCLE_ARTIFACTS/coverage/$PROJECT
	cp $ROOT/$PROJECT/testing/coverage/* $CIRCLE_ARTIFACTS/coverage/$PROJECT 2>/dev/null || true
done
