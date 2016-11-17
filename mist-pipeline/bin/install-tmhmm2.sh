#!/bin/bash

set -e

TARGET_DIR=$1

if [[ -z "$TARGET_DIR" ]]; then
	echo "Usage: $0 <target directory>"
	exit 1
fi

BIN_PATH=$TARGET_DIR/bin

if [[ -z "$BIN_PATH/decodeanhmm.Linux_x86_64" ]]; then
	echo "TMHMM2 is already installed"
	exit
fi


DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

./install-proprietary-tool.sh tmhmm2 TMHMM2_SECURE_URL $TARGET_DIR

chmod +x $BIN_PATH/decodeanhmm.Linux_x86_64
