#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$DIR/..

cd $ROOT

NODE_PATH=node_modules

node src/start-api.js
