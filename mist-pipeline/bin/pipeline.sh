#!/bin/bash

# Always attempt to install tmhmm2
if [[ ! -z "$TMHMM2_SECURE_URL" ]]; then
  yarn install-tmhmm2
fi

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

NODE_PATH=$DIR/../node_modules node $DIR/../src/pipeline.js "$@" | $DIR/../node_modules/.bin/bunyan
