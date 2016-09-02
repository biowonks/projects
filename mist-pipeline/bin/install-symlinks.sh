#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/..

cd $ROOT

NODE_PATH=node_modules
SYMLINK=../_common/create-symlink.js
node $SYMLINK ../../../mist-lib src/node_modules/mist-lib
echo '(symlink) src/node_modules/mist-lib --> ../../../mist-lib'
node $SYMLINK ../lib src/node_modules/lib
echo '(symlink) src/node_modules/lib --> ../lib'
node $SYMLINK ../_common/.eslintrc.js
echo '(symlink) ../_common/.eslintrc.js --> .eslintrc.js'
