#!/bin/bash
#
# >&2 echo ... <--- output to stderr; http://stackoverflow.com/a/23550347

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

CHANGED_PROJECTS=$($DIR/git-changed-projects.sh)
if [[ -z "$CHANGED_PROJECTS" ]]; then
	(>&2 echo "====> No project changes detected")
	exit
fi

PROJECTS_TO_BUILD=$(node $DIR/list-dependent-projects.js $DIR/inter-project.dependencies.js $CHANGED_PROJECTS)

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
