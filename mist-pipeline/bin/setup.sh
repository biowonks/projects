#!/bin/bash

set -e

npm run install-vendor-tools
npm run install-hmmer3
npm run install-hmmer2
npm run install-tmhmm2

if [ -z ${CI+x} ]; then
	npm run install-agfam
	npm run install-ecf
	npm run install-pfam
else
	echo "===> CI variable is defined. Skipping installation of agfam, ecf, and pfam."
fi

echo
echo "-----------------------------------------------------------"
echo "MiST pipeline setup complete"
