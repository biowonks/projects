#!/bin/bash

set -e

BRANCH=$1
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..
SUFFIX=""

if [[ -z $BRANCH ]]; then
	echo "Usage: deploy-to-heroku.sh <branch> <project> [<project> ...]"
	exit 1
fi
shift

case "$BRANCH" in
	develop)
		SUFFIX="-boom"
		;;
	staging)
		SUFFIX="-staging"
		;;
esac

for PROJECT in "$@"; do
	cd $ROOT
	case "$PROJECT" in
		mist-api)
			HEROKU_APP_NAME=$PROJECT$SUFFIX
			HEROKU_REPO_DIR=~/heroku/$HEROKU_APP_NAME
			PROJECT_DIR=$ROOT/$PROJECT
			echo "====> Initiating deploy $PROJECT ($BRANCH branch) to Heroku: $HEROKU_APP_NAME"
			if [[ ! -e $HEROKU_REPO_DIR ]]; then
				echo "FATAL: heroku repository does not exist in $HEROKU_REPO_DIR; please edit circle.yml and add $HEROKU_APP_NAME to the list of arguments supplied to the fetch-heroku-repos.sh command and retry."
				exit 1
			fi

			echo "====> Syncing project files with Heroku repo (rsync)"
			# Rsync options (note did not use -a because it copies symlinks as symlinks, which is not
			#   desired in this case)
			# -r: recursive
			# -L: copy files referred to by links
			# -p: preserve permissions
			# -t: preserve modification times
			# -g: preserve group
			# -v: verbose
			# --copy-dirlinks: copy any symlinked directories
			# --delete: remove files in destination that are not in the source directories
			# --delete-excluded: remove those that are excluded if present in the destination
			rsync -rLptgv --copy-dirlinks --delete --delete-excluded --filter='P .git' --exclude mist-api/node_modules --exclude .vscode mist-api/ /home/ulrich/heroku/mist-api-boom/

			echo "====> Committing changes and pushing to Heroku repository"
			LAST_GIT_COMMENT=$(git log -1 --pretty=%B)
			cd ~/heroku/$HEROKU_APP_NAME
			git add -A
			git commit -m "Automated CircleCI commit (build: $CIRCLE_BUILD_NUM, $CIRCLE_BUILD_URL)" -m "$LAST_GIT_COMMENT"
			git push
			;;
	esac
done
