#!/bin/bash

set -e

# Reference: http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
# Get the directory of this script
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/..

npm install

GULP=./node_modules/gulp/bin/gulp.js
$GULP install-coils
$GULP install-hmmer3
$GULP install-seg

$GULP install-pfam
