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
TMPDIR=$ROOT/tmp
mkdir -p $TMPDIR

# Retrieve any prior code coverage reports from s3
echo "====> Creating temporary directories: tmp/s3 and tmp/coverage"
mkdir -p $TMPDIR/s3 $TMPDIR/coverage
echo ""

echo "====> Downloading previous coverage files from s3"
aws s3 cp "s3://biowonks/circleci/$BRANCH/coverage.tar.gz" $TMPDIR/s3/coverage.tar.gz 2>/dev/null || true
if [[ -s $TMPDIR/s3/coverage.tar.gz ]]; then
	tar -C $TMPDIR/s3 -xf $TMPDIR/s3/coverage.tar.gz
else
	echo "      None found"
fi
echo ""

echo "====> Collecting coverage reports for each build target"
for PROJECT in "$@"; do
	if [[ -s $PROJECT/testing/coverage/coverage.json ]]; then
		echo "      >> $PROJECT: using coverage from THIS build"
		cp $PROJECT/testing/coverage/coverage.json $TMPDIR/coverage/coverage.$PROJECT.json
	elif [[ -s $TMPDIR/s3/coverage/coverage.$PROJECT.json ]]; then
		echo "      << $PROJECT: using coverage from PREVIOUS build"
		mv $TMPDIR/s3/coverage/coverage.$PROJECT.json $TMPDIR/coverage
	else
		echo "      *** WARNING: no coverage data found"
	fi
done
echo ""

# Create the new tarball coverage
echo "====> Saving results into new tarball"
tar -C $TMPDIR -czf $TMPDIR/coverage.tar.gz coverage
aws s3 cp --storage-class=REDUCED_REDUNDANCY $TMPDIR/coverage.tar.gz "s3://biowonks/circleci/$BRANCH/coverage.tar.gz"
echo ""

# Create the final combined report
echo "====> Combining code coverage reports"
mkdir -p $CIRCLE_ARTIFACTS/coverage # In case it does not already exist
docker run -e CI=true -v $ROOT:/app -w /app/tmp biowonks/node-bootstrap ../node_modules/.bin/istanbul report --dir /app/tmp/coverage/all json lcov
cp -r $TMPDIR/coverage/all/lcov-report $CIRCLE_ARTIFACTS/coverage/all
mv $TMPDIR/coverage/all/coverage-final.json $TMPDIR/coverage/all/coverage.json
cp $TMPDIR/coverage/all/* $CIRCLE_ARTIFACTS/coverage/all 2> /dev/null || true
echo ""

echo "====> Uploading results to codecov"
$ROOT/node_modules/.bin/codecov -f $TMPDIR/coverage/all/lcov.info --disable=gcov
