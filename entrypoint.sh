#!/bin/bash

chown mist3:mist3 $HOME/api/node_modules

exec /usr/local/bin/gosu mist3 "$@"
