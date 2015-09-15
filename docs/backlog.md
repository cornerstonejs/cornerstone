Backlog:
========
* more viewport functionality
  * pseudo color tables (for PET, MRI)
* Enhance cache to work with multiframe sop instance case
* Very large image support (e.g. pathology > 4kx4k resolution)
* Performance related
  * switch to lower resolution image during ww/wc operation to improve framerate
  * only regenerate the part of the rendered image that is actually visible - perhaps by tiling it
* Consider having multiple renderCanvas or one per enabled element
* Create a CustomElement for cornerstone images http://www.html5rocks.com/en/tutorials/webcomponents/customelements/
* Sharing of LUT's between multiple viewports for linked ww/wc use case
