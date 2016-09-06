#!/bin/bash
#
# Removes all vendor-related files

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm -rf $DIR/../vendor/*
