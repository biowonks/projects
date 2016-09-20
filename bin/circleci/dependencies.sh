#!/bin/bash

set -e
set -x

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

# Small speed-up; https://twitter.com/gavinjoyce/status/691773956144119808
cd $ROOT
npm set progress=false && npm prune && npm install

# All tests will be run on the docker image
$DIR/util/setup-test-docker-image.sh
$DIR/util/detect-projects-to-build.sh build-targets.txt $CIRCLE_BRANCH > ~/projects-to-build.txt
$DIR/util/install-dependencies.sh $(cat ~/projects-to-build.txt)

# Cache heroku repository state - clones or updates from Heroku
$DIR/util/setup-heroku.sh
$DIR/util/fetch-heroku-repos.sh ~/heroku mist-api-develop
