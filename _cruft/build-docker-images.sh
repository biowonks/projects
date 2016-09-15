#!/bin/bash
#
# Potential optimization: if nothing has changed in the project; skip the docker save command.
# Possible approach:
# 1. Capture the IMAGE_ID after building the image:
#
#    IMAGE_ID=$(docker build -t biowonks/core-lib . 2>/dev/null | awk '/Successfully built/{print $NF}')
#
# 2. Suffix the tarballs with the relevant hash:
#
#    ~/docker/core-lib.a5e04e0df2c8.tar
#
# 3. If a docker image tar does not exist with that hash:
#
#    $ rm ~/docker/core-lib.*
#    $ docker save biowonks/core-lib > ~/docker/core-lib.$IMAGE_ID.tar

set -e

# Move to the root project directory
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..

dockerLoad() {
	echo -e "\n>> Pre-loading docker image for: $1"
	DOCKER_IMAGE_TAR=~/docker/$1.tar
	if [[ -e $DOCKER_IMAGE_TAR ]]; then
		docker load -i $DOCKER_IMAGE_TAR
	fi
}

dockerSave() {
	PREFIX=$1
	IMAGE_NAME=$2
	echo -e "\n>> Saving docker image: $PREFIX/$IMAGE_NAME"
	DOCKER_IMAGE_TAR=~/docker/$IMAGE_NAME.tar
	mkdir -p ~/docker
	docker save $PREFIX/$IMAGE_NAME > $DOCKER_IMAGE_TAR
}

setupNodeBootstrap() {
	dockerLoad node-bootstrap
	docker build -t biowonks/node-bootstrap -f Dockerfile.node-bootstrap .
	dockerSave biowonks node-bootstrap
}

loadBuildSave() {
	PROJECT_NAME=$1
	BASE_PROJECT_NAME=$PROJECT_NAME.base
	pushd $PROJECT_NAME
	if [[ -e Dockerfile.base ]]; then
		dockerLoad $BASE_PROJECT_NAME
		docker build -t biowonks/$BASE_PROJECT_NAME -f Dockerfile.base .
		dockerSave biowonks $BASE_PROJECT_NAME
	fi

	dockerLoad $PROJECT_NAME
	docker build -t biowonks/$PROJECT_NAME .
	dockerSave biowonks $PROJECT_NAME

	popd
}

# ---------------------------------------------------------
setupNodeBootstrap

for project in "$@"
do
	echo -e "\n###########################################################"
	loadBuildSave "$project"
done
