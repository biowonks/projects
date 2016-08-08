#!/bin/bash

set -e

npm install
npm run install-coils
npm run install-seg
npm run install-hmmer3
npm run install-pfam

echo "\n"
echo "-----------------------------------------------------------"
echo "MiST setup complete"
