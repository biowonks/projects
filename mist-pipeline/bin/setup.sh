#!/bin/bash

set -e

npm install
npm run install-vendor-tools
npm run install-hmmer3
npm run install-agfam
npm run install-pfam

echo ""
echo "-----------------------------------------------------------"
echo "MiST setup complete"
