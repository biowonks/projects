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

git diff --name-only ${CIRCLE_BRANCH}^ $CIRCLE_BRANCH | awk 'BEGIN {FS="/"} /^[^._]+\// && $1 != "bin" && $1 != "mist-local-db" && $1 != "fql" {print $1}' | sort -u
