#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../../..

mkdir -p $CIRCLE_TEST_REPORTS/junit
$ROOT/bin/merge-junit-reports.js $(awk '{print $1 "/test-results.xml" }' ~/projects-to-build.txt) > $CIRCLE_TEST_REPORTS/junit/test-results.xml
$DIR/util/tweak-coverage.sh $CIRCLE_BRANCH $(cat $ROOT/build-targets.txt)
