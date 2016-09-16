#!/bin/bash
#
# Approach:
# 1a) Inspect git log to determine which top-level projects have changes
# 1b) Remove the built indicator file from cache directory (if it exists)
# 2) Enumerate those projects that have previously been built as determined by the presence
#    of the file: ~/cache/built/${project name}
# 3) Identify unbuilt projects by taking the difference between the list of all build
#    targets (contained in $ROOT/build-targets.txt) and those from the prior step
# 4a) Enumerate all projects that need to be built taking into account any dependent projects
# 4b) Remove the built indicator file from the cache directory for each of the projects in
#    the prior step. This provides for making the next commit re-run all failed dependent
#    projects as well.

set -e

BUILD_TARGETS_FILE=$1
BRANCH=$2

# >&2 echo ... <--- output to stderr; http://stackoverflow.com/a/23550347
echoSTDERR() {
	(>&2 echo "$1")
}

echoUsage() {
	echoSTDERR "detect-projects-to-build.sh <build targets file> <git branch>"
}

if [[ -z $BUILD_TARGETS_FILE || -z $BRANCH ]]; then
	echoUsage
	exit 1
fi

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CACHE_BUILT_DIR=~/cache/built/$BRANCH
mkdir -p $CACHE_BUILT_DIR

removeCacheBuiltFiles() {
	if [[ -n $1 ]]; then
		for PROJECT_NAME in $1; do
			CACHE_FILE=$CACHE_BUILT_DIR/$PROJECT_NAME
			if [[ -e $CACHE_FILE ]]; then
				echoSTDERR ">>>>> Removing cache built file: $CACHE_FILE"
				rm -f $CACHE_FILE
			fi
		done
	fi
}

echoProjects() {
	if [[ -z $1 ]]; then
		echoSTDERR "      (None)"
	fi

	for i in $1; do
		echoSTDERR "      * $i"
	done
}

# Step 1a
GIT_CHANGED_PROJECTS=$($DIR/git-changed-projects.sh $BRANCH)
# Step 1b
removeCacheBuiltFiles $GIT_CHANGED_PROJECTS
# Step 2
CACHED_BUILT_PROJECTS=$(find $CACHE_BUILT_DIR -maxdepth 1 -type f -exec basename \{\} \; | sort)
# Step 3
UNBUILT_PROJECTS=$(comm -23 <(sort $BUILD_TARGETS_FILE) <(echo "$CACHED_BUILT_PROJECTS"))

if [[ -z "$UNBUILT_PROJECTS" ]]; then
	(>&2 echo "====> No outstanding projects to build")
	exit
fi

# Step 4a
PROJECTS_TO_BUILD=$(node $DIR/list-dependent-projects.js $DIR/inter-project.dependencies.js $UNBUILT_PROJECTS)

# Step 4b
removeCacheBuiltFiles "$PROJECTS_TO_BUILD"

# Indicate what we detected
echoSTDERR "====> Projects with source code changes:"
echoProjects "$GIT_CHANGED_PROJECTS"
echoSTDERR ""
echoSTDERR "====> Projects to build:"
echoProjects "$PROJECTS_TO_BUILD"

echo "$PROJECTS_TO_BUILD"
