#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

NODE_PATH=$DIR/../node_modules node $DIR/../src/pipeline.js "$@" | $DIR/../node_modules/.bin/bunyan
