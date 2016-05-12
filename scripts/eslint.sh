#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..
node_modules/.bin/eslint 'pipeline/scripts/**/*.js'
