Build System
============

This project uses webpack to build the software.

Pre-requisites:
---------------

NodeJs - [click to visit web site for installation instructions](http://nodejs.org).

Common Tasks
------------

Update dependencies (after each pull):
> npm install

Running the build:
> npm start

Automatically running the build after each source change:
> npm run watch

Publish New Version
------------

1. Update the package and dependency versions in "package.json"
2. Update the dependencies:
    > npm install
3. Update the build version:
    > npm run version
4. Run the build:
    > npm run build
5. Tag and push the commit
6. Publish to npm:
    > npm publish
