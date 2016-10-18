#!/bin/bash

BASE_DIR=$1
if [[ -z $BASE_DIR ]]; then
	echo "Usage: fetch-heroku-repos.sh <local path> <app name> [<app name> ...]"
	exit 1
fi
shift

set -e

git config --global user.name 'CircleCI'
git config --global user.email 'lukeulrich@circleci.com'

mkdir -p $BASE_DIR

for APP_NAME in "$@"; do
	cd $BASE_DIR
	echo "====> Heroku:$APP_NAME"
	if [[ -e $BASE_DIR/$APP_NAME ]]; then
		echo "      (Pulling latest changes)"
		cd $APP_NAME
		git fetch
		# Quite possible that this repository is empty. If so,
		# git merge will choke because it won't find a master branch'
		git merge || true
	else
		echo "      (Cloning)"
		git clone ssh://git@heroku.com/$APP_NAME.git
	fi
	echo ""
done
