#!/bin/bash

set -e

VERSION=$1
TARGET_DIR=$2
HMMER2_BINDIR=$3

if [[ -z "$VERSION" || -z "$TARGET_DIR" || -z "$HMMER2_BINDIR" ]]; then
	echo "Usage: $0 <ecf version> <target directory> <hmmer2 bindir>"
	exit 1
fi

if [[ ! $VERSION =~ ^[1-9][0-9]*\.[0-9]$ ]] ; then
	echo 'Missing or invalid version!'
	exit 1
fi

ECF_HMM_NAME=ecfs

if [[ -s "$TARGET_DIR/$ECF_HMM_NAME" &&
	-s "$TARGET_DIR/$ECF_HMM_NAME.bin" &&
	-s "$TARGET_DIR/$ECF_HMM_NAME.bin.ssi" &&
	-s "$TARGET_DIR/ecf_general.hmm" ]]; then
	echo "ECF $VERSION database is already installed"
	exit
fi

TARBALL_FILENAME="${VERSION}.tar.gz"
ECF_URL=https://github.com/biowonks/ecf/archive/$TARBALL_FILENAME

mkdir -p $TARGET_DIR
cd $TARGET_DIR

if [[ ! -s "$ECF_HMM_NAME" ]]; then
	echo "Downloading ECF $VERSION HMM database"
	wget -q -O "$TARBALL_FILENAME" $ECF_URL
  tar zxvf $TARBALL_FILENAME
  mv ecf-$VERSION/* .
  rmdir ecf-$VERSION
fi

echo "Preparing ECF HMM database"
$HMMER2_BINDIR/hmmconvert -b ecfs ecfs.bin
$HMMER2_BINDIR/hmmindex ecfs.bin

echo "Successfully installed ECF $VERSION database"
