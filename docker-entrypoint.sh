#!/usr/bin/env sh

if [ -z "$INPUT_TOKEN" ] ; then
  echo "One of the required params is empty. Please check all input params. Exiting..."
  exit 1
fi

if [ -z "$INPUT_ID" ] && [ -z "$INPUT_NAME" ] ; then
  echo "Either ID or Name of the tunnel must be specified. Exiting..."
  exit 1
fi

node /usr/src/app/main.js >&1
