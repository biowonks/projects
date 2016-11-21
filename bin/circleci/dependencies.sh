#!/bin/bash

set -e
set -x

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

# Small speed-up; https://twitter.com/gavinjoyce/status/691773956144119808
cd $ROOT
npm set progress=false && npm install -g yarn && yarn

# All tests will be run on the docker image
$DIR/util/setup-test-docker-image.sh

# The following two lines automatically detect which projects have changed and intelligently
# only run those tests. Unfortunately, this has complicated the code-coverage generation as
# it has to re-use the code coverage from previous builds. Until this gets fixed, simply
# re-run all tests regardless. Just keeping it simple for now (21 Nov 2016).
#
# $DIR/util/detect-projects-to-build.sh build-targets.txt $CIRCLE_BRANCH > ~/projects-to-build.txt
# $DIR/util/install-dependencies.sh $(cat ~/projects-to-build.txt)

$DIR/util/install-dependencies.sh $(cat $ROOT/build-targets.txt)

# Cache heroku repository state - clones or updates from Heroku
$DIR/util/fetch-heroku-repos.sh ~/heroku mist-api-develop
