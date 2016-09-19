#!/bin/bash

set -e

if [[ -z $1 ]]; then
	echo "Usage: tweak-coverage.sh <build target> ..."
	exit 1
fi

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/../..

cd $ROOT

# Retrieve any prior code coverage reports from S3
echo "====> Creating temporary directories: /tmp/s3 and /tmp/coverage"
mkdir -p /tmp/s3 /tmp/coverage
echo ""

echo "====> Downloading previous coverage files from S3"
aws s3api get-object --bucket biowonks --key circleci/coverage.tar.gz /tmp/s3/coverage.tar.gz 2>/dev/null || true
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
tar -C /tmp -czf coverage.tar.gz coverage
aws s3 cp --storage-class=REDUCED_REDUNDANCY coverage.tar.gz s3://biowonks/circleci/coverage.tar.gz
echo ""

# Create the final combined report
echo "====> Combining code coverage reports"
mkdir -p $CIRCLE_ARTIFACTS/coverage # In case it does not already exist
node_modules/.bin/istanbul report --root /tmp/coverage --dir /tmp/coverage/all json lcov 2>/dev/null
cp -r /tmp/coverage/all/lcov-report $CIRCLE_ARTIFACTS/coverage/all
mv /tmp/coverage/all/coverage-final.json /tmp/coverage/all/coverage.json
cp /tmp/coverage/all/* $CIRCLE_ARTIFACTS/coverage/all > /dev/null
echo ""

# TODO: Submit to codecov
echo "====> Uploading results to codecov"
