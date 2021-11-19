Development Process
===================

NOTE: This document describes the proposed development process for cornerstone and related libraries (e.g. dicomParser).
Please feel free to post your thoughts and contribute to it.

Principles
----------

* the 'master' branch is always releasable

* the 'master' branch should never degrade in functionality or quality

Process
-------

To support the above principles, the following process is followed:

* All work shall be done on feature branches.  A feature branch is a git branch based on the 'master' branch created
  specifically for a given feature.

* Pull request shall be made for feature branches only.  Pull requests for changes to 'master' or 'dev' branches
  will be rejected.

* Owners of feature branches are responsible for keeping their feature branch up to date (rebased) with the 'master'
  branch.

* Once a library maintainer determines a feature branch is of sufficient quality, they shall merge it into the
  'dev' branch.

* Once a library maintainer determines that the 'dev' branch is ready for testing, an announcement will be made
  to the cornerstone platform google group asking for volunteers to help test it.

* Once a library maintainer determines that the 'dev' branch has been suitably tested, they will merge it into
  'master' and post a message on the cornerstone platform forum listing the changes.

* If a regression in functionality or quality is observed in a new release, library maintainers shall work to
  fix or revert the change as quickly as possible.


Quality
-------

* Unit tests should be provided that exercise most (if not all) code paths

* All unit tests must pass before release

* Test data shall be provided to assist with functional testing

* Code shall pass jshint without generating any warnings


