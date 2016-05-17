#!/bin/bash

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/coils

set -e

echo "Compiling"
rm -f ncoils
cc -O2 -I. -o ncoils ncoils.c read_matrix.c -lm
