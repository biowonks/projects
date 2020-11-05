#!/bin/bash

set -e

TARGET_DIR=$1
if [[ -z "$TMHMM2_SECURE_URL" ]]; then
	TMHMM2_SECURE_URL=$2
fi

if [[ -z "$TARGET_DIR" ]]; then
	echo "Usage: $0 <target directory> <tmhmm2 source url>"
	exit 1
fi

BIN_PATH=$TARGET_DIR/bin

if [[ -s "$BIN_PATH/decodeanhmm.Linux_x86_64" ]]; then
	echo "TMHMM2 is already installed"
	exit
fi

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

if [[ -z "$TMHMM2_SECURE_URL" ]]; then
	echo "Please set the environment variable, TMHMM2_SECURE_URL, or pass this value to this script to install TMHMM2. This value should be an accessible URL containing the TMHMM2.0 source code. Skipping installation..."
else
	./install-proprietary-tool.sh tmhmm2 $TMHMM2_SECURE_URL $TARGET_DIR

	chmod +x $BIN_PATH/decodeanhmm.Linux_x86_64
fi
