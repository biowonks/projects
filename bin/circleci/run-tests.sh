#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

cd $ROOT

for PROJECT in "$@"; do
	echo "====> Running $PROJECT tests"
	docker run -e CI=$CI -v $ROOT:/app -w /app/$PROJECT biowonks/node-bootstrap npm test

	# Copy over any junit test reports
	if [[ -e $ROOT/$PROJECT/test-results.xml ]]; then
		cp $ROOT/$PROJECT/test-results.xml $CIRCLE_TEST_REPORTS/junit/$PROJECT.test-results.xml
	fi
done
