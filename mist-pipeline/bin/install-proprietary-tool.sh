#!/bin/bash

set -e

TOOL_NAME=$1
URL=$2
TARGET_DIR=$3
BIN_PATH=$TARGET_DIR/bin

if [[ -z "$TOOL_NAME" || -z "$URL" || -z "$TARGET_DIR" ]]; then
	echo "Usage: $0 <tool name> <url> <target directory>"
	exit 1
fi

TARBALL_FILENAME="${TOOL_NAME}.tar.gz"

echo "Downloading ${TOOL_NAME} to /tmp/biowonks/${TARBALL_FILENAME}"
mkdir -p /tmp/biowonks/${TOOL_NAME}
cd /tmp/biowonks

rm -f $TARBALL_FILENAME
wget --no-check-certificate -q -O $TARBALL_FILENAME "$URL"
echo "Decompressing to /tmp/biowonks/${TOOL_NAME}"
tar zxvf $TARBALL_FILENAME -C $TOOL_NAME --strip-components=1

echo "Installing in ${TARGET_DIR}"
mkdir -p $TARGET_DIR
cp -r /tmp/biowonks/$TOOL_NAME/* $TARGET_DIR

echo "Successfully installed ${TOOL_NAME}"
rm -rf /tmp/biowonks/$TOOL_NAME
