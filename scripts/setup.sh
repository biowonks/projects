#!/bin/bash

# Reference: http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
# Get the directory of this script
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/..

npm install

GULP=./node_modules/.bin/gulp
$GULP install-coils
$GULP install-hmmer3
$GULP install-pfam
