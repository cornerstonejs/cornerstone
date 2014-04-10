cornerstone
===========

cornerstone is a lightweight JavaScript library for displaying medical images in modern web browsers that support
the HTML5 canvas element .  It is not meant to be a complete application itself, but instead a component
that can be used to build a variety of complex applications from.  See the
[cornerstoneDemo](https://github.com/chafey/cornerstoneDemo) for an example of using the various cornerstone
libraries to build a simple study viewer.

cornerstone is agnostic to the actual container used to store image pixels as well as the transport mechanism
used to get the image data.  In fact, cornerstone by itself has no ability to display any type of images but instead
depends on an [ImageLoader](https://github.com/chafey/cornerstone/wiki/ImageLoader) for this.  The goal here is
to avoid constraining developers to specific image containers or transport mechanisms.  It is hoped that developers
feel empowered to load images from any type of image container using any kind of transport.  See the
[cornerstoneWADOImageLoader](https://github.com/chafey/cornerstoneWADOImageLoader) project for an example
of a DICOM WADO based Image Loader.

cornerstone is agnostic to the exact interaction paradigm being used.  It does not include any mouse, touch or
keyboard bindings to manipulate the various image properties such as scale, translation or ww/wc.  The goal here
is to avoid constraining developers using this library to fit into a given ui paradigm.  It is hoped that developers
are empowered to create new paradigms possibly using new input mechanisms to interact with medical images (e.g. kinect,
accelerometer).  cornerstone does provide a set of API's allowing manipulation of the image properoties via javascript.
See the [cornerstoneTools](https://github.com/chafey/cornerstoneTools) library for an example of common tools built on top of
cornerstone.

Live Examples
---------------
The best way to see the power of this library is to actually see it in use.

[Click here for a list of examples of using the cornerstone library.](https://rawgithub.com/chafey/cornerstone/master/example/index.html)

Install
-------

**NOTE: This project is still in alpha development stage, use of the library is not yet recommended as
functionality it not complete, bugs exist, API's will change and documentation is missing or not correct**

Get a packaged source file:

* [cornerstone.js](https://raw.githubusercontent.com/chafey/cornerstone/master/dist/cornerstone.js)
* [cornerstone.min.js](https://raw.githubusercontent.com/chafey/cornerstone/master/dist/cornerstone.min.js)

Or install via [Bower](http://bower.io/): (NOTE: Bower support not yet available but coming soon!)

> bower install cornerstone


Key Features
------------

 * HTML5/Javascript based library to easily add interactive medical images to web applications
 * Serves as a foundation to build more complex medical imaging applications from - enterprise viewer, report viewer, etc.
 * Supports all HTML5 based browsers including mobile, tablet and desktop
 * Displays all common medical image formats (e.g. 8 bit grayscale, 16 bit grayscale, RGB)
 * High performance image display
 * Retrieval of images from different systems with different protocols via Image Loader plugin design
 * API support for changing viewport properties (e.g. ww/wc, zoom, pan, invert)

Build System
============

This project uses grunt to build the software.

Pre-requisites:
---------------

NodeJs - [click to visit web site for installation instructions](http://nodejs.org).

grunt-cli

> npm install -g grunt-cli

Common Tasks
------------

Update dependencies (after each pull):
> npm install

> bower install

Running the build:
> grunt

Automatically running the build and unit tests after each source change:
> grunt watch

Links
=====

[View the wiki for documentation on the concepts and APIs](https://github.com/chafey/cornerstone/wiki)

[View Roadmap](docs/roadmap.md)

[View Backlog](docs/backlog.md)

[comp.protocols.dicom thread](https://groups.google.com/forum/#!topic/comp.protocols.dicom/_2fMh69GdAM)

[Trello](https://trello.com/b/tGTDIyt4/cornerstone)

[cornerstoneTools](https://github.com/chafey/cornerstoneTools) - A library of common tools that can be used with cornerstone

[cornerstoneWADOImageLoader ](https://github.com/chafey/cornerstoneWADOImageLoader) - A cornerstone Image Loader that works with WADO

[dicomParser ](https://github.com/chafey/dicomParser) - A javascript library designed to parse DICOM for web browsers

FAQ
===

_Why did you decide to license this library using the open source MIT license?_

The main reason this library is released as open source is that I believe that medical imaging in particular
can do more to improve patient outcomes and the lack of open source libraries is a major obstacle.  The old adage
[a picture is worth a thousand words](http://en.wikipedia.org/wiki/A_picture_is_worth_a_thousand_words)
is very true in medical imaging.  When a patient is going through a disease process, they are often
filled with fear and confusion.  Medical terminology is complex and imaging provides a connection between people
unlike any other medium.  By helping a patient (and its supporting friends/family) connect with the disease
visually through images, it is believed that fear, anxiety and confusion will all be reduced and this will result
in better outcomes.

Because of this belief, it is my hope that this library be used to build a variety of applications and experiences
to deliver on this vision.  The MIT library allows this library to be used in any type of application - personal,
open source and commercial and is therefore necessary to achieve this goal.  If you are reading this,
I hope you can join me in this quest as I believe there is much good work remaining to be done.

_Why doesn't cornerstone natively support the display of DICOM images?_

While DICOM has support for just about every type of medical image, there are many cases where medical images
are not stored in DICOM format.  A good example of this is dermatology where images are often taken using standard
digital cameras and are stored as JPEG not DICOM.  The main reason this library is not based around DICOM is
that it wants to reach the widest possible adoption and that will be accomplished by supporting as many types
of image containers and transports possible.  Note that it is expected that most images displayed using this
library will be DICOM images.  Another side effect of this approach is that the code base is
smaller and easier to understand since it is focused on doing exactly one thing.  Display of DICOM images can
be accomplished using the separate [cornerstoneWADOImageLoader](https://github.com/chafey/cornerstoneWADOImageLoader)
library.

_Why doesn't cornerstone include basic tools like ww/wc using the mouse?_

There is no standard for user interaction in medical imaging and a wide variety of interaction paradigms exist.
For example, one medical imaging application may use the left mouse button to adjust ww/wc and another may use the
right mouse button.  The main reason this library does not include tools is that it wants to reach the widest possible
adoption and that will only be accomplished by making any interaction paradigm possible.  No tools
are therefore provided with this library allowing users of the library to choose
whatever interaction paradigm they like.  It is also hoped that this approach will make it easier for developers
to experiment with new user input mechanisms like Kinect or Accelerometers.  Another side effect of this
approach is that the code base is smaller and easier to understand since it is focused on doing exactly one
thing.  Tools are provided using the separate [cornerstoneTools](https://github.com/chafey/cornerstoneTools)
if desired.

_Why does this library require HTML5 canvas when IE8 is the main browser used in healthcare?_

The fact that IE8 is the most popular commonly used web browser in healthcare right now is a temporary
situation.  It is expected that 50% of the industry will have HTML5 based web browsers deployed by the end
of 2015 and 90% by 2017.  The library made a tradeoff to focus on the future platform to keep the code base
simple and avoid compromises related to older browser technology.  Note that it may be possible to get
this library to work on IE8 using [excanvas](https://code.google.com/p/explorercanvas/) but I haven't tried
it yet.


Copyright
=========

Copyright 2014 Chris Hafey [chafey@gmail.com](mailto:chafey@gmail.com)


