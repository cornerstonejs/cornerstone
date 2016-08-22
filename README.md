Cornerstone Core
================

Cornerstone is an open source project with a goal to deliver a complete web based medical imaging platform.  This
repository contains the Cornerstone Core component which is a lightweight JavaScript library for displaying
medical images in modern web browsers that support the HTML5 canvas element.
Cornerstone Core is not meant to be a complete application itself, but instead a component
that can be used as part of larger more complex applications.  See the
[CornerstoneDemo](http://chafey.github.io/cornerstoneDemo/) for an example of using the various Cornerstone
libraries to build a simple study viewer.

Cornerstone Core is agnostic to the actual container used to store image pixels as well as the transport mechanism
used to get the image data.  In fact, Cornerstone Core itself has no ability to read/parse or load images and instead
depends on one or more [ImageLoaders](https://github.com/chafey/cornerstone/wiki/ImageLoader) to function.
The goal here is to avoid constraining developers to work within a single container and transport (e.g. DICOM) since
images are stored in a variety of formats (including proprietary).  By providing flexibility with respect to the
container and transport, the highest performance image display may be obtained as no conversion to an alternate
container or transport is required.  It is hoped that developers feel empowered to load images from any type of image
container using any kind of transport.  See the
[CornerstoneWADOImageLoader](https://github.com/chafey/cornerstoneWADOImageLoader) project for an example
of a DICOM WADO based Image Loader.

Cornerstone Core is agnostic to the exact interaction paradigm being used.  It does not include any mouse, touch or
keyboard bindings to manipulate the various image properties such as scale, translation or ww/wc.  The goal here
is to avoid constraining developers using this library to fit into a given ui paradigm.  It is hoped that developers
are empowered to create new paradigms possibly using new input mechanisms to interact with medical images (e.g.
[Kinect](http://en.wikipedia.org/wiki/Kinect) or [Accelerometer](http://en.wikipedia.org/wiki/Accelerometer).
Cornerstone does provide a set of API's allowing manipulation of the image properties via javascript.
See the [CornerstoneTools](https://github.com/chafey/cornerstoneTools) library for an example of common tools built on top of
Cornerstone.

Community
---------

Have questions?  Try posting on our [google groups forum](https://groups.google.com/forum/#!forum/cornerstone-platform).

Live Examples
---------------
The best way to see the power of this library is to actually see it in use.

[Click here for a list of examples of using the Cornerstone library.](https://rawgit.com/chafey/cornerstone/master/example/index.html)

Install
-------

Get a packaged source file:

* [cornerstone.js](https://raw.githubusercontent.com/chafey/cornerstone/master/dist/cornerstone.js)
* [cornerstone.min.js](https://raw.githubusercontent.com/chafey/cornerstone/master/dist/cornerstone.min.js)

Or install via [Bower](http://bower.io/):

> bower install cornerstone


Key Features
------------

 * HTML5/Javascript based library to easily add interactive medical images to web applications
 * Serves as a foundation to build more complex medical imaging applications from - enterprise viewer, report viewer, etc.
 * Supports all HTML5 based browsers including mobile, tablet and desktop
 * Displays all common medical image formats (e.g. 8 bit grayscale, 16 bit grayscale, RGB color)
 * High performance image display
 * Retrieval of images from different systems with different protocols via Image Loader plugin design
 * API support for changing viewport properties (e.g. ww/wc, zoom, pan, invert)


Links
=====

[Development Process](docs/developmentProcess.md)

[Build System](docs/building.md)

[View the wiki for documentation on the concepts and APIs](https://github.com/chafey/cornerstone/wiki)

[View Roadmap](docs/roadmap.md)

[View Backlog](docs/backlog.md)

[2014 comp.protocols.dicom thread that started this project](https://groups.google.com/forum/#!topic/comp.protocols.dicom/_2fMh69GdAM)

[CornerstoneTools](https://github.com/chafey/cornerstoneTools) - A library of common tools that can be used with Cornerstone

[CornerstoneWADOImageLoader ](https://github.com/chafey/cornerstoneWADOImageLoader) - A Cornerstone Image Loader that works with WADO-URI, WADO-RS and DICOM P10 files

[dicomParser ](https://github.com/chafey/dicomParser) - A JavaScript library designed to parse DICOM for web browsers

Code Contributors
=================

I welcome pull requests, please see FAQ below for guidance on this.

* @simonmd - CSS improvements in the cornerstoneDemo application
* @doncharkowsky - The angle tool in cornerstoneTools
* @prasath-rasterimages - Touch event bindings in cornerstoneTools
* @jpamburn - Performance optimizations for signed data, fixes for image caching
* @jmhmd - for getPixels() implementation
* @devishree-raster - for flip and rotate implementation

FAQ
===

_Why did you decide to license this library using the open source MIT license?_

The main reason this library is released as [open source](http://en.wikipedia.org/wiki/Open_source) is
that I believe that medical imaging in particular can do a lot more to improve patient outcomes
but the cost of doing so is prohibitive.  Making this library open source removes the cost barrier and will
hopefully usher in a new set of medical imaging based applications.

The old adage [a picture is worth a thousand words](http://en.wikipedia.org/wiki/A_picture_is_worth_a_thousand_words)
is very true in medical imaging.  When a patient is going through a disease process, they often face fear
and confusion.  Medical terminology amplifies these issues as it is hard to understand and therefore
disempowering.  Medical imaging allows a mysterious health issue to be visualized and therefore brings a
level of understanding that just can't be accomplished via textual information found in lab or radiology
reports.  By helping a patient (and its supporting friends/family) connect with the disease visually through
images, it is believed that fear, anxiety and confusion will all be reduced which
will increase optimism and therefore patient outcomes.

It is my hope that this library be used to build a variety of applications and experiences
to deliver on this vision.  The MIT license allows this library to be used in any type of application - personal,
open source and commercial and is therefore appropriate to support this vision.  If you are reading this,
I hope you can join me in this mission as there is still a lot to be done.

_Why doesn't Cornerstone natively support the display of DICOM images?_

While DICOM has support for just about every type of medical image, there are many cases where medical images
are not stored in DICOM format.  In many cases, a PACS may receive DICOM images but store them in a proprietary
format on disk.  In this case, it can be faster to access images by having an image loader that works with
a proprietary PACS interface that would not require conversion from the proprietary format into a standard format
like DICOM.  Another example of this is is dermatology where images are often taken using standard
digital cameras and are stored as JPEG not DICOM.

The main reason this library is not based around DICOM is that it wants to reach the widest possible adoption
and that will be accomplished by supporting as many types of image containers and transports possible.
Another side effect of this approach is that the code base is smaller and easier to understand since
it is focused on doing exactly one thing.  That being said, it is is expected that the majority of images
displayed using this library will have originated as DICOM images.  It is therefore important to make sure
that there are no limitations with respect to displaying the different types of DICOM images and have robust
supporting libraries for DICOM.  Separate libraries to add DICOM specific support already exist, check out the
[CornerstoneWADOImageLoader](https://github.com/chafey/cornerstoneWADOImageLoader) library and
the [dicomParser](https://github.com/chafey/dicomParser) library.

_Why doesn't Cornerstone include basic tools like ww/wc using the mouse?_

There is no standard for user interaction in medical imaging and a wide variety of interaction paradigms exist.
For example, one medical imaging application may use the left mouse button to adjust ww/wc and another may use the
right mouse button.  The main reason this library does not include tools is that it wants to reach the widest possible
adoption and that will only be accomplished by making any interaction paradigm possible.  No tools
are therefore provided with this library allowing users of the library to choose
whatever interaction paradigm they like.  It is also hoped that this approach will make it easier for developers
to experiment with new user input mechanisms like [Kinect](http://en.wikipedia.org/wiki/Kinect) or
[Accelerometer](http://en.wikipedia.org/wiki/Accelerometer).  Another side effect of this
approach is that the code base is smaller and easier to understand since it is focused on doing exactly one
thing.  Tools are provided using the separate [CornerstoneTools](https://github.com/chafey/cornerstoneTools)
if desired.

_Why doesn't this library support older browsers like IE8?_

Much of the performance in this library is possible due to utilizing modern web features such as HTML5 canvas,
high performance javascript engines and WebGL.  These feature are not avaialble in IE8 and there are no suitable
polyfills available.  Sorry, upgrade your browser.

_Why doesn't this library support stacks of images?_

Images stack functionality such as a CT series or MRI series can actually be quite complex.  Regardless of
what stack functionality is desired, all stacks ultimately need to be able to display a single image and that
is what this library is focused on doing.  Stack functionality is therefore pushed up to a higher layer.  The
[CornerstoneTools](https://github.com/chafey/cornerstoneTools) contains stack functionality and is a good place
to look to see how various stack related functionality is implemented.

_How do you envision this library supporting 3D functionality such as MPR, MIP and VR?_

This library would be responsible for displaying the rendered image to the user.  The rendering of the
3D image would be done by some other library - perhaps on the server side.  This library is purely 2D and has
no knowledge of 3D image space.  It will probably make sense to have several layers on top of this library
to provide 3D functionality.  For example, one layer that has a 3D viewport with properties such as transformation
matrix, slice thickness, transfer function/LUT, segmentation masks, etc.  And another 3D tools layer that provides
various tools on top of the 3d viewport (rotate, zoom, segment, scroll, etc).

OHIF/Cornerstone is working with the 3DSlicer project to integrate the two.  I also expect to implement
client side MPR at some point as the browsers seem to be handling large memory much better.

_Why did you add jQuery as a dependency?_

Primarily for its custom event handling.

_I would like to contribute code - how do I do this?_

Fork the repository, make your change and submit a pull request.

_Any guidance on submitting changes?_

While I do appreciate code contributions, I will not merge it unless it meets the following criteria:

* Functionality is appropriate for the repository.  Consider posting on the forum if you are not sure
* Code quality is acceptable.  I don't have coding standards defined, but make sure it passes jshint and looks like
   the rest of the code in the repository.
* Quality of design is acceptable.  This is a bit subjective so you should consider posting on the forum for specific guidance

I will provide feedback on your pull request if it fails to meet any of the above.

Please consider separate pull requests for each feature as big pull requests are very time consuming to understand.
It is highly probably that I will reject a large pull request due to the time it would take to comprehend.

_Will you add feature XYZ for me?_

If it is in the roadmap, I intend to implement it some day - probably when I actually need it.  If you really need
something now and are willing to pay for it, try posting on the cornerstone platform google group

Copyright
=========

Copyright 2016 Chris Hafey [chafey@gmail.com](mailto:chafey@gmail.com)


