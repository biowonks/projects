#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

CHANGED_PROJECTS=$($DIR/get-changed-projects.sh)
PROJECTS_TO_BUILD=$(node $DIR/get-dependent-projects.js $DIR/inter-project.dependencies.js $CHANGED_PROJECTS)

# >&2 echo ... <--- output to stderr; http://stackoverflow.com/a/23550347
(>&2 echo "----> Changed Projects:")
for i in $CHANGED_PROJECTS; do
	(>&2 echo "      * $i")
done
(>&2 echo)
(>&2 echo "----> Projects to build:")
for i in $PROJECTS_TO_BUILD; do
	(>&2 echo "      * $i")
done

echo $PROJECTS_TO_BUILD
