#!/bin/bash

set -ex

TARGET=gs://figurl/figneuro-1

yarn upgrade
yarn build
gsutil -m cp -R ./build/* $TARGET/