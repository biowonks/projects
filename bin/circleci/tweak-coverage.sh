#!/bin/bash

set -e

if [[ $# -lt 2 ]]; then
	echo "Usage: tweak-coverage.sh <branch> <build target> ..."
	exit 1
fi

BRANCH=$1
shift

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

cd $ROOT

# Retrieve any prior code coverage reports from s3
echo "====> Creating temporary directories: /tmp/s3 and /tmp/coverage"
mkdir -p /tmp/s3 /tmp/coverage
echo ""

echo "====> Downloading previous coverage files from s3"
aws s3 cp "s3://biowonks/circleci/$BRANCH/coverage.tar.gz" /tmp/s3/coverage.tar.gz 2>/dev/null || true
if [[ -s /tmp/s3/coverage.tar.gz ]]; then
	tar -C /tmp/s3 -xf /tmp/s3/coverage.tar.gz
else
	echo "      None found"
fi
echo ""

echo "====> Collecting coverage reports for each build target"
for PROJECT in "$@"; do
	if [[ -s $PROJECT/testing/coverage/coverage.json ]]; then
		echo "      >> $PROJECT: using coverage from THIS build"
		cp $PROJECT/testing/coverage/coverage.json /tmp/coverage/coverage.$PROJECT.json
	elif [[ -s /tmp/s3/coverage/coverage.$PROJECT.json ]]; then
		echo "      << $PROJECT: using coverage from PREVIOUS build"
		mv /tmp/s3/coverage/coverage.$PROJECT.json /tmp/coverage
	else
		echo "      *** WARNING: no coverage data found"
	fi
done
echo ""

# Create the new tarball coverage
echo "====> Saving results into new tarball"
tar -C /tmp -czf /tmp/coverage.tar.gz coverage
aws s3 cp --storage-class=REDUCED_REDUNDANCY /tmp/coverage.tar.gz "s3://biowonks/circleci/$BRANCH/coverage.tar.gz"
echo ""

# Create the final combined report
echo "====> Combining code coverage reports"
mkdir -p $CIRCLE_ARTIFACTS/coverage # In case it does not already exist
node_modules/.bin/istanbul report --root /tmp/coverage --dir /tmp/coverage/all json lcov
cp -r /tmp/coverage/all/lcov-report $CIRCLE_ARTIFACTS/coverage/all
mv /tmp/coverage/all/coverage-final.json /tmp/coverage/all/coverage.json
cp /tmp/coverage/all/* $CIRCLE_ARTIFACTS/coverage/all 2> /dev/null || true
echo ""

echo "====> Uploading results to codecov"
# $ROOT/node_modules/.bin/codecov -f