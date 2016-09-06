#!/bin/bash

set -e

VERSION=$1
TARGET_DIR=$2
HMMER3_BINDIR=$3

if [[ -z "$VERSION" || -z "$TARGET_DIR" || -z "$HMMER3_BINDIR" ]]; then
	echo "Usage: $0 <agfam version> <target directory> <hmmer3 bindir>"
	exit 1
fi

if [[ ! $VERSION =~ ^[1-9][0-9]*\.[0-9]$ ]] ; then
	echo 'Missing or invalid version!'
	exit 1
fi

AGFAM_HMM_NAME=agfam.hmm

if [[ -s "$TARGET_DIR/$AGFAM_HMM_NAME" &&
	-s "$TARGET_DIR/$AGFAM_HMM_NAME.h3f" &&
	-s "$TARGET_DIR/$AGFAM_HMM_NAME.h3i" &&
	-s "$TARGET_DIR/$AGFAM_HMM_NAME.h3m" &&
	-s "$TARGET_DIR/$AGFAM_HMM_NAME.h3p" ]]; then
	echo "Agfam $VERSION database is already installed"
	exit
fi

AGFAM_HMM_URL="https://github.com/biowonks/agfam/blob/v$VERSION/$AGFAM_HMM_NAME?raw=true"

mkdir -p $TARGET_DIR

if [[ ! -s "$TARGET_DIR/$AGFAM_HMM_NAME" ]]; then
	echo "Downloading Agfam $VERSION HMM database"
	wget --no-verbose -O "$TARGET_DIR/$AGFAM_HMM_NAME" $AGFAM_HMM_URL
fi

cd $TARGET_DIR
echo "Preparing Agfam HMM database"
$HMMER3_BINDIR/hmmpress -f ./$AGFAM_HMM_NAME

echo "Successfully installed Agfam $VERSION database"
