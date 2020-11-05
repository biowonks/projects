#!/bin/bash
#
# Installs the chemotaxis model database <version> to <target directory>. Assumes
# that the hmmpress binary (part of HMMER3) is  in the $PATH environment variable.

# exit immediately if any command fails
set -e

VERSION=$1
TARGET_DIR=$2
HMMER3_BINDIR=$3

if [[ -z "$VERSION" || -z "$TARGET_DIR" || -z "$HMMER3_BINDIR" ]]; then
	echo "Usage: $0 <chemotaxis model version> <target directory> <hmmer3 bindir>"
	exit 1
fi

if [[ ! $VERSION =~ ^[1-9][0-9]*\.[0-9]$ ]] ; then
	echo 'Missing or invalid version!'
	exit 1
fi

CHE_HMM_NAME="che.hmm"
GZ_CHE_HMM_NAME="$CHE_HMM_NAME.gz"
CHE_HMM_URL="https://github.com/biowonks/chemotaxis-models/releases/download/$VERSION/$GZ_CHE_HMM_NAME"

if [[ -s "$TARGET_DIR/$CHE_HMM_NAME" &&
	-s "$TARGET_DIR/$CHE_HMM_NAME.h3f" &&
	-s "$TARGET_DIR/$CHE_HMM_NAME.h3i" &&
	-s "$TARGET_DIR/$CHE_HMM_NAME.h3m" &&
	-s "$TARGET_DIR/$CHE_HMM_NAME.h3p" ]]; then
	echo "Chemotaxis models v$VERSION is already installed"
	exit
fi

if [[ ! -s "$TARGET_DIR/$CHE_HMM_NAME" ]]; then
	echo "Downloading chemotaxis models v$VERSION HMM database"
	wget -q -O "/tmp/$GZ_CHE_HMM_NAME" $CHE_HMM_URL
	echo "Decompressing"
	gunzip "/tmp/$GZ_CHE_HMM_NAME"
	echo "Copying to $TARGET_DIR"
	mkdir -p $TARGET_DIR
	mv "/tmp/$CHE_HMM_NAME" $TARGET_DIR
fi

cd $TARGET_DIR
echo "Preparing chemotaxis models HMM database"
$HMMER3_BINDIR/hmmpress -f ./$CHE_HMM_NAME

echo "Successfully installed chemotaxis models v$VERSION database"
