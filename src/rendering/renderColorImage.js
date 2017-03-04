/**
 * This module is responsible for drawing an image to an enabled elements canvas element
 */
import { generateLut } from '../internal/generateLut.js';
import { storedColorPixelDataToCanvasImageData } from '../internal/storedColorPixelDataToCanvasImageData';
import { setToPixelCoordinateSystem } from '../setToPixelCoordinateSystem';

var colorRenderCanvas = document.createElement('canvas');
var colorRenderCanvasContext;
var colorRenderCanvasData;

var lastRenderedImageId;
var lastRenderedViewport = {};

function initializeColorRenderCanvas(image)
{
    // Resize the canvas
    colorRenderCanvas.width = image.width;
    colorRenderCanvas.height = image.height;

    // get the canvas data so we can write to it directly
    colorRenderCanvasContext = colorRenderCanvas.getContext('2d');
    colorRenderCanvasContext.fillStyle = 'white';
    colorRenderCanvasContext.fillRect(0,0, colorRenderCanvas.width, colorRenderCanvas.height);
    colorRenderCanvasData = colorRenderCanvasContext.getImageData(0,0,image.width, image.height);
}


function getLut(image, viewport)
{
    // if we have a cached lut and it has the right values, return it immediately
    if(image.lut !== undefined &&
        image.lut.windowCenter === viewport.voi.windowCenter &&
        image.lut.windowWidth === viewport.voi.windowWidth &&
        image.lut.invert === viewport.invert) {
        return image.lut;
    }

    // lut is invalid or not present, regenerate it and cache it
    generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
    image.lut.windowWidth = viewport.voi.windowWidth;
    image.lut.windowCenter = viewport.voi.windowCenter;
    image.lut.invert = viewport.invert;
    return image.lut;
}

function doesImageNeedToBeRendered(enabledElement, image)
{
    if(image.imageId !== lastRenderedImageId ||
        lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
        lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
        lastRenderedViewport.invert !== enabledElement.viewport.invert ||
        lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
        lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
        lastRenderedViewport.vflip !== enabledElement.viewport.vflip
        )
    {
        return true;
    }

    return false;
}

function getRenderCanvas(enabledElement, image, invalidated)
{

    // The ww/wc is identity and not inverted - get a canvas with the image rendered into it for
    // fast drawing
    if(enabledElement.viewport.voi.windowWidth === 255 &&
        enabledElement.viewport.voi.windowCenter === 128 &&
        enabledElement.viewport.invert === false &&
        image.getCanvas &&
        image.getCanvas()
    )
    {
        return image.getCanvas();
    }

    // apply the lut to the stored pixel data onto the render canvas
    if(doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
        return colorRenderCanvas;
    }

    // If our render canvas does not match the size of this image reset it
    // NOTE: This might be inefficient if we are updating multiple images of different
    // sizes frequently.
    if(colorRenderCanvas.width !== image.width || colorRenderCanvas.height != image.height) {
        initializeColorRenderCanvas(image);
    }

    // get the lut to use
    var colorLut = getLut(image, enabledElement.viewport);

    // the color image voi/invert has been modified - apply the lut to the underlying
    // pixel data and put it into the renderCanvas
    storedColorPixelDataToCanvasImageData(image, colorLut, colorRenderCanvasData.data);
    colorRenderCanvasContext.putImageData(colorRenderCanvasData, 0, 0);
    return colorRenderCanvas;
}

/**
 * API function to render a color image to an enabled element
 * @param enabledElement
 * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
 */
export function renderColorImage(enabledElement, invalidated) {

    if(enabledElement === undefined) {
        throw "drawImage: enabledElement parameter must not be undefined";
    }
    var image = enabledElement.image;
    if(image === undefined) {
        throw "drawImage: image must be loaded before it can be drawn";
    }

    // get the canvas context and reset the transform
    var context = enabledElement.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    // clear the canvas
    context.fillStyle = 'black';
    context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

    // turn off image smooth/interpolation if pixelReplication is set in the viewport
    if(enabledElement.viewport.pixelReplication === true) {
        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
    }
    else {
        context.imageSmoothingEnabled = true;
        context.mozImageSmoothingEnabled = true;
    }

    // save the canvas context state and apply the viewport properties
    context.save();
    setToPixelCoordinateSystem(enabledElement, context);

    var renderCanvas = getRenderCanvas(enabledElement, image, invalidated);

    context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

    context.restore();

    lastRenderedImageId = image.imageId;
    lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
    lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
    lastRenderedViewport.invert = enabledElement.viewport.invert;
    lastRenderedViewport.rotation = enabledElement.viewport.rotation;
    lastRenderedViewport.hflip = enabledElement.viewport.hflip;
    lastRenderedViewport.vflip = enabledElement.viewport.vflip;
}
