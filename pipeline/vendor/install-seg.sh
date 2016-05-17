#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/seg

set -e

echo "Compiling"
rm -f seg
make seg
