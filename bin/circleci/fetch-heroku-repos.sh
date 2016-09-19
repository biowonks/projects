#!/bin/bash

BASEDIR=$1
if [[ -z $BASEDIR ]]; then
	echo "Usage: fetch-heroku-repos.sh <local path> <app name> [<app name> ...]"
	exit 1
fi
shift

set -e

mkdir -p $BASEDIR

for APP_NAME in "$@"; do
	cd $BASEDIR
	echo "====> Heroku:$APP_NAME"
	if [[ -e $BASEDIR/$APP_NAME ]]; then
		echo "      (Pulling latest changes)"
		cd $APP_NAME
		git pull
	else
		echo "      (Cloning)"
		heroku git:clone -a $APP_NAME
	fi
	echo ""
done
