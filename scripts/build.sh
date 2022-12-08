#!/bin/sh

7z a -r dist.7z ./dist/package.json ./dist/yarn.lock ./dist/node_modules
rm -rf dist
7z x -r -y dist.7z -oc:\dist
rm dist.7z
tsc