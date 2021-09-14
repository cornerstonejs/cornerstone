#!/bin/bash

# Set directory to location of this script
# https://stackoverflow.com/a/3355423/1867984
cd "$(dirname "$0")"
pwd
ls

## Generate API Docs
cd ..
ls
#npm run docs:api

# Try to patch Gitbook's broken deep dependency on graceful-fs
npm install npm@latest --save
npm install --save gitbook-cli
cd ./node_modules/npm
npm install graceful-fs@4.2.0 --save
cd ../../
cd ./node_modules/gitbook-cli/node_modules/npm
npm install graceful-fs@4.2.0 --save
cd ../../../../
./node_modules/gitbook-cli/bin/gitbook.js fetch

# Generate latest output
# Clear previous output, generate new
cd ./docs
rm -rf _book
../node_modules/gitbook-cli/bin/gitbook.js install
../node_modules/gitbook-cli/bin/gitbook.js build
cd ../
cp assets/CNAME docs/_book/CNAME
cd docs/_book

# Set User
git config --global user.email "erik.sweed@gmail.com"
git config --global user.name "swederik"

git init
git add -A
git commit -m 'Update compiled GitBook (this commit is automatic)'
git push -f https://github.com/cornerstonejs/cornerstone.git master:gh-pages
