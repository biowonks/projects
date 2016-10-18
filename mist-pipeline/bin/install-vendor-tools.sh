#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENDOR_DIR=$DIR/../vendor
VENDOR_TOOLS_DIR=$VENDOR_DIR/vendor-tools
mkdir -p $VENDOR_DIR
cd $VENDOR_DIR

if [[ ! -s $VENDOR_TOOLS_DIR ]]; then
	git clone --depth=1 --branch=master https://github.com/biowonks/vendor-tools.git
else
	cd $VENDOR_TOOLS_DIR
	git pull
fi

cd $VENDOR_TOOLS_DIR
make
