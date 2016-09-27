#!/bin/bash

set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT=$(readlink -f $DIR/..)
ROUTES_DIR=$ROOT/src/routes
DOC_BASE_DIR=$ROOT/src/docs
DOC_INCLUDES_DIR=$DOC_BASE_DIR/source/includes

# REST Endpoints
echo "Collating REST Endpoints documentation"
REST_ENDPOINTS_MD_FILE=$DOC_INCLUDES_DIR/rest-endpoints.md
node $DIR/util/generate-rest-endpoint-md.js $ROUTES_DIR shell:curl node python ruby > $REST_ENDPOINTS_MD_FILE
# find $ROUTES_DIR -name '*.md' -type f -print0 | xargs -0 cat > $REST_ENDPOINTS_MD_FILE

# Data Structures
DATA_STRUCTURES_MD_FILE=$DOC_INCLUDES_DIR/data-structures.md
node $DIR/util/generate-data-structure-md.js > $DATA_STRUCTURES_MD_FILE

# Finally, build the final documentation HTML
cd $DOC_BASE_DIR
npm run build
