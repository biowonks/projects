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

cat > $HOME/.netrc <<EOF
machine api.heroku.com
    login $HEROKU_USER
    password $HEROKU_API_KEY
machine git.heroku.com
    login $HEROKU_USER
    password $HEROKU_API_KEY
EOF

chmod 600 ~/.netrc

git config --global user.name 'CircleCI'
git config --global user.email 'biowonks@gmail.com'
