#!/bin/bash
#
# Strategy:
# It is not possible to cache output during any phase of the Circle CI build except during the
# dependencies phase. Thus, for our monorepo, it is not directly possible to indicate which project
# tests pass (or fail). To work around this, it is necessary to query the Circle REST API for the
# last build status.
#
# Maintain the following two files (per branch) in the cache directory:
# 1) ~/cache/build-info/$BRANCH/built-projects.txt: maintains a list of projects that have been
#    successfully built thus far (excludes failures from the most recent build - again this is
#    because it is not possible to store this information during the test phase).
#
# 2) ~/cache/build-info/$BRANCH/projects-to-build.txt: list of projects that were detected to build
#    in the last build.
#
# Using the above two files, information from the git log, along with the last build status it is
# possible to accurately accomplish the following:
#
# a) Build a project if it has not been built before
# b) Build all projects from the previous build even if the most recent source code changes do
#    not affect the failed project (e.g. commit only contains changes in a completely unrelated
#    project).
# c) Build projects have direct source code changes
# d) Build those projects that depend on projects with direct source code changes (e.g. projects
#    depending a shared library. For example, if mist-lib contains a change, it is necessary to
#    also build mist-api and mist-pipeline which depend on mist-lib).
#
# Also, note that only projects in the build targets specified within the BUILD_TARGETS_FILE (the
# first argument to this script) are processed. If a specified project does not belong to this list
# it is silently ignored.
#
# Steps:
# 1a) Get the last build status by querying the CircleCI REST API
# 1b) If the last build was successful, add the previous projects to build
#     ($CACHE_PROJECTS_TO_BUILD_FILE) into the list of successfully built projects
#     ($CACHE_BUILT_PROJECTS_FILE)
# 1c) If the last build failed, remove list of projects to build ($CACHE_PROJECTS_TO_BUILD_FILE)
#     from built list ($CACHE_BUILT_PROJECTS_FILE).
# 2a) Inspect git log to determine which top-level projects have changes
# 2b) Remove these projects from the built projects file ($CACHE_BUILT_PROJECTS_FILE)
# 3) Enumerate those projects that have previously been built ($CACHED_BUILT_PROJECTS)
# 4) Identify unbuilt projects by taking the difference between the list of all build
#    targets (contained in $ROOT/build-targets.txt) and those from the prior step
# 5a) Enumerate all projects that need to be built taking into account any dependent projects
# 5b) Remove the built indicator file from the cache directory for each of the projects in
#    the prior step. This provides for making the next commit re-run all failed dependent
#    projects as well.
# 6) Store the projects attempted to be built this round

set -e

BUILD_TARGETS_FILE=$1
BRANCH=$2

# >&2 echo ... <--- output to stderr; http://stackoverflow.com/a/23550347
echoSTDERR() {
	(>&2 echo "$1")
}

if [[ -z $BUILD_TARGETS_FILE || -z $BRANCH ]]; then
	echoSTDERR "detect-projects-to-build.sh <build targets file> <git branch>"
	exit 1
fi

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CACHE_BUILT_DIR=~/cache/build-info/$BRANCH
mkdir -p $CACHE_BUILT_DIR
CACHE_BUILT_PROJECTS_FILE=$CACHE_BUILT_DIR/built-projects.txt
CACHE_PROJECTS_TO_BUILD_FILE=$CACHE_BUILT_DIR/projects-to-build.txt

# Ensure the relevant cache files exist (avoid errors from commands expecting file to already exist)
touch $CACHE_BUILT_PROJECTS_FILE $CACHE_PROJECTS_TO_BUILD_FILE

removeFromCacheBuiltFile() {
	PROJECT_NAMES=$1
	if [[ -n $PROJECT_NAMES ]]; then
		perl -i -e '$file=pop(@ARGV); $pattern=join("|", @ARGV); @ARGV=($file); while(<>) { /^($pattern)$/ || print; }' $PROJECT_NAMES $CACHE_BUILT_PROJECTS_FILE
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

removeDuplicateLines() {
	perl -i -ne 'print if !$x{$_}++' $1
}

# Step 1a
LAST_BUILD_STATUS=$(curl -s "https://circleci.com/api/v1.1/project/github/biowonks/projects/tree/f-circleci-testing?limit=1&circle-token=$CIRCLE_TOKEN" | python -c "import sys, json; x = json.load(sys.stdin)[0]; print x['previous']['status'] if x is not None else 'success'")
echoSTDERR "====> Last build status: $LAST_BUILD_STATUS"
if [[ $LAST_BUILD_STATUS = 'success' ]]; then
	echoSTDERR '      * Updating list of built projects'
	# Step 1b
	# The last build succeeded. Add projects to the success list
	cat $CACHE_PROJECTS_TO_BUILD_FILE >> $CACHE_BUILT_PROJECTS_FILE
	removeDuplicateLines $CACHE_BUILT_PROJECTS_FILE
else
	echoSTDERR '      * Removing previous build projects from list of those successfully built'
	# Step 1c
	# The last build failed. Remove all such projects from the built list
	removeFromCacheBuiltFile "$(cat $CACHE_PROJECTS_TO_BUILD_FILE)"
fi

# Step 2a
GIT_CHANGED_PROJECTS=$($DIR/git-changed-projects.sh $BRANCH)
# Step 2b
removeFromCacheBuiltFile $GIT_CHANGED_PROJECTS
# Step 3
CACHED_BUILT_PROJECTS=$(cat $CACHE_BUILT_PROJECTS_FILE | sort)
# Step 4
UNBUILT_PROJECTS=$(comm -23 <(sort $BUILD_TARGETS_FILE) <(echo "$CACHED_BUILT_PROJECTS"))

if [[ -z "$UNBUILT_PROJECTS" ]]; then
	echoSTDERR "====> No outstanding projects to build"
	# Empty the projects to build file
	> $CACHE_PROJECTS_TO_BUILD_FILE
	exit
fi

# Step 5a
PROJECTS_TO_BUILD=$(node $DIR/list-dependent-projects.js $DIR/inter-project.dependencies.js $UNBUILT_PROJECTS)

# Step 5b
removeFromCacheBuiltFile $PROJECTS_TO_BUILD

# Step 6
echo "$PROJECTS_TO_BUILD" > $CACHE_PROJECTS_TO_BUILD_FILE

# Indicate what we detected
echoSTDERR "====> Projects with source code changes:"
echoProjects "$GIT_CHANGED_PROJECTS"
echoSTDERR ""
echoSTDERR "====> Projects to build:"
echoProjects "$PROJECTS_TO_BUILD"

echo "$PROJECTS_TO_BUILD"
