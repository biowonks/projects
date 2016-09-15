#!/bin/bash

set -e

npm run install-vendor-tools
npm run install-hmmer3

if [[ -z ${CI+x} ]]; then
	npm run install-agfam
	npm run install-pfam
else
	echo "Skipping installation of agfam and pfam"
fi

echo ""
echo "-----------------------------------------------------------"
echo "MiST setup complete"
