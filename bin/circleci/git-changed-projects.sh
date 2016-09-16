#!/bin/bash
#
# Returns a unique list of top-level project folders that have at least one change
# in the git repository.
#
# The following top-level folders are excluded:
#   any beginning with . or _
#   bin
#   mist-local-db
#   fql

set -e

# >&2 echo ... <--- output to stderr; http://stackoverflow.com/a/23550347
echoSTDERR() {
	(>&2 echo "$1")
}

echoUsage() {
	echoSTDERR "git-changed-projects.sh <git branch>"
}

BRANCH=$1

if [[ -z $BRANCH ]]; then
	echoUsage
	exit 1
fi

git diff --name-only ${BRANCH}^ $BRANCH | awk 'BEGIN {FS="/"} /^[^._]+\// && $1 != "bin" && $1 != "mist-local-db" && $1 != "fql" {print $1}' | sort -u
