#!/bin/bash

set -e

VERSION=$1
TARGET_DIR=$2

if [[ -z "$VERSION" || -z "$TARGET_DIR" ]]; then
	echo "Usage: $0 <hmmer2 version> <target directory>"
	exit 1
fi

BIN_PATH=$TARGET_DIR/bin

if [[ -s "$BIN_PATH/hmmsearch" &&
	-s "$BIN_PATH/hmmpfam" ]]; then
	echo "HMMER2 version $VERSION is already installed"
	exit
fi

# E.g. http://eddylab.org/software/hmmer/2.4i/hmmer-2.4i.tar.gz
TARBALL_BASENAME="hmmer-${VERSION}"
TARBALL_FILENAME="$TARBALL_BASENAME.tar.gz"
HMMER2_URL="http://eddylab.org/software/hmmer/$VERSION/$TARBALL_FILENAME"

echo "Downloading HMMER2 tarball (version ${VERSION})"
cd /tmp
rm -f $TARBALL_FILENAME
wget -q $HMMER2_URL
echo "Decompressing tarball"
tar zxvf $TARBALL_FILENAME
cd $TARBALL_BASENAME
./configure --prefix $TARGET_DIR
make
make install
echo "Cleaning up"
cd /tmp
rm -rf $TARBALL_BASENAME
rm $TARBALL_FILENAME
PATH=$BIN_PATH:$PATH
export PATH

echo "Successfully installed HMMER2 (version $VERSION)"
