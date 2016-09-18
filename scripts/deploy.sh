#!/bin/sh

# Copyright (c) Eric Bidelman

deployVersion=$1

if [ -z "$deployVersion" ]
then
  echo "App version not specified."
  echo "Usage: deploy.sh `date +%Y-%m-%d`"
  exit 0
fi

readonly APPDIR=$(dirname $BASH_SOURCE)

echo "\nBuilding app version: $deployVersion\n"
gulp

echo "Deploying app version: $deployVersion"
gcloud app deploy $APPDIR/../app.yaml \
    --project jackieeric-wedding --version $deployVersion --no-promote \
    --account ebidel@gmail.com
