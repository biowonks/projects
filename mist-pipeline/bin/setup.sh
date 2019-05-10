#!/bin/bash

set -e

yarn install-vendor-tools
yarn install-hmmer3
yarn install-hmmer2
yarn install-tmhmm2

if [ -z ${CI+x} ]; then
	yarn install-agfam
	yarn install-ecf
	yarn install-pfam
	yarn install-chemotaxis-models
else
	echo "===> CI variable is defined. Skipping installation of agfam, ecf, and pfam."
fi

echo
echo "-----------------------------------------------------------"
echo "MiST pipeline setup complete"
