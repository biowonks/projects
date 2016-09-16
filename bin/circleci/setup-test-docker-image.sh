#!/bin/bash
#
# Inspired by:
# https://www.hackzine.org/caching-docker-image-on-circleci.html
# https://gist.github.com/rshk/beecd2c49f81a380d805c8b461b4c704

# Move to the root project directory
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../..

VERSION_TAG=$(sha1sum Dockerfile.node-bootstrap docker.node-bootstrap.entrypoint.sh .dockerignore | sha1sum | cut -d' ' -f1)
IMAGE_FULL_NAME="biowonks/node-bootstrap:$VERSION_TAG"

echo "Image version: $VERSION_TAG"
echo "Image name:    $IMAGE_FULL_NAME"

CACHE_DIR=$(readlink -f ~/cache/docker)
IMAGE_TARFILE_BASENAME=node-bootstrap.$VERSION_TAG.tar
IMAGE_TARFILE=$CACHE_DIR/$IMAGE_TARFILE_BASENAME

mkdir -p $CACHE_DIR

BUILD_IMAGE=true

if [[ -e $IMAGE_TARFILE ]]; then
	BUILD_IMAGE=false

	echo "----> Loading existing image"
	docker load -i $IMAGE_TARFILE

	if (( $? )); then
		echo "Oops! An error occurred while attempting to load the existing docker image tarball"
		rm -f $IMAGE_TARFILE
		BUILD_IMAGE=true
	fi
fi

if [[ $BUILD_IMAGE = "true" ]]; then
	OLD_IMAGES=$(find $CACHE_DIR -name 'node-bootstrap.*.tar')

	echo "====> Building new image"
	docker build --build-arg LOCAL_USER_ID=$(id -u) -t biowonks/node-bootstrap -f Dockerfile.node-bootstrap .

	echo "====> Saving image to cache"
	docker save biowonks/node-bootstrap > $IMAGE_TARFILE

	for i in $OLD_IMAGES; do
		OLD_IMAGE_BASENAME=$(basename $i)
		echo "      Removing obsolete image: $OLD_IMAGE_BASENAME"
		rm -f $i
	done
fi

echo ">>>>> Docker test image ready"
