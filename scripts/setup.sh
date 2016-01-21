#!/bin/bash

# Reference: http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
# Get the directory of this script
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/..
npm install
ln -sf node_modules/gulp/bin/gulp.js gulp
ln -sf node_modules/mocha/bin/mocha mocha
