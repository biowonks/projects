#!/bin/bash

# Ensure the permissions on the node_modules folder are set to our desired user
chown biowonk:biowonk $HOME/mist-api/node_modules
