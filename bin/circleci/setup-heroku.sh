#!/bin/bash

if [[ -z $CIRCLECI ]]; then
	echo "This script is intended to be performed in the CircleCI environment only"
	exit 1
fi

if [[ -z $HEROKU_API_KEY ]]; then
	echo "HEROKU_API_KEY is not set"
	exit 1
fi

if [[ -z $HEROKU_USER ]]; then
	echo "HEROKU_USER is not set"
	exit 1
fi

if [ ! -f "${HOME}/.ssh/id_heroku.com.pub" ]; then
  echo "SSH is not set for Heroku in CircleCI. set here https://circleci.com/gh/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/edit#ssh"
  exit 1
fi

cat > $HOME/.netrc <<EOF
machine api.heroku.com
    login $HEROKU_USER
    password $HEROKU_API_KEY
EOF

chmod 600 ~/.netrc
