#!/bin/bash

chown mist:mist $HOME/api/node_modules

exec su-exec mist "$@"
