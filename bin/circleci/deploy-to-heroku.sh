#!/bin/bash

set -e

BRANCH=$1

if [[ -z $BRANCH ]]; then
	echo "Usage: deploy-to-heroku.sh <branch> <project> [<project> ...]"
	exit 1
fi

shift

for PROJECT in "$@"; do
	echo "====> Starting to deploy $PROJECT to Heroku"

done
