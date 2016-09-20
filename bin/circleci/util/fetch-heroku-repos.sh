#!/bin/bash

BASE_DIR=$1
if [[ -z $BASE_DIR ]]; then
	echo "Usage: fetch-heroku-repos.sh <local path> <app name> [<app name> ...]"
	exit 1
fi
shift

set -e

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
		heroku git:clone -a $APP_NAME
	fi
	echo ""
done
