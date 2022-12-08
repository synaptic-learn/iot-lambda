#!/bin/sh

rm -f dist.zip
7z a dist.zip ./dist/* -x!package.json -x!yarn.lock