#!/bin/bash
#
# Removes all vendor-related files (apart from those in the repository, e.g. coils source code)

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Removing coils binary"
rm -f $DIR/coils/ncoils
echo "Removing hmmer3 directory"
rm -rf $DIR/hmmer3
echo "Removing seg binary"
rm -f $DIR/seg/seg

echo "Removing pfam directory"
rm -rf $DIR/pfam
