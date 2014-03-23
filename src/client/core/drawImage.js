
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas')
    renderCanvas.width = 1024;
    renderCanvas.height = 1024;

    function drawImage(ee, image) {

        var context = ee.canvas.getContext('2d');

        context.setTransform(1, 0, 0, 1, 0, 0);

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);

        // setup the viewport
        context.save();

        setToPixelCoordinateSystem(ee, context);

        // Generate the LUT
        // TODO: Cache the LUT and only regenerate if we have to
        image.windowCenter = ee.viewport.windowCenter;
        image.windowWidth = ee.viewport.windowWidth;
        var lut = cornerstoneCore.generateLut(image);

        // apply the lut to the stored pixel data onto the render canvas
        var renderCanvasContext = renderCanvas.getContext("2d");
        var imageData = renderCanvasContext.createImageData(image.columns, image.rows);
        cornerstoneCore.storedPixelDataToCanvasImageData(image, lut, imageData.data);
        renderCanvasContext.putImageData(imageData, 0, 0);

        var scaler = ee.viewport.scale;

        // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
        //context.webkitImageSmoothingEnabled = false;
        context.drawImage(renderCanvas, 0,0, image.columns, image.rows, 0, 0, image.columns, image.rows);

        context.restore();

        var event = new CustomEvent(
            "CornerstoneImageRendered",
            {
                detail: {
                    canvasContext: context,
                    viewport: ee.viewport,
                    image: ee.image,
                    element: ee.element,
                    enabledElement: ee,
                },
                bubbles: false,
                cancelable: false
            }
        );
        ee.element.dispatchEvent(event);
    };

    function setToPixelCoordinateSystem(ee, context)
    {
        // reset the transformation matrix
        context.setTransform(1, 0, 0, 1, 0, 0);
        // move origin to center of canvas
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        // apply the scale
        context.scale(ee.viewport.scale, ee.viewport.scale);
        // apply the pan offset
        context.translate(ee.viewport.centerX, ee.viewport.centerY);
        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-ee.image.columns /2, -ee.image.rows/2);
    };

    function setToFontCoordinateSystem(ee, context, fontSize)
    {
        // reset the transformation matrix
        context.setTransform(1, 0, 0, 1, 0, 0);
        // move origin to center of canvas
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        // apply the scale
        context.scale(ee.viewport.scale, ee.viewport.scale);
        // apply the pan offset
        context.translate(ee.viewport.centerX, ee.viewport.centerY);

        var fontScale = .1;
        // apply the font scale
        context.scale(fontScale, fontScale);
        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-ee.image.columns /2 / fontScale, -ee.image.rows/2 / fontScale);

        // return the font size to use
        var scaledFontSize = fontSize / ee.viewport.scale / fontScale;
        // TODO: actually calculate this?
        var lineHeight  = fontSize / ee.viewport.scale / fontScale;

        return {
            fontSize :scaledFontSize,
            lineHeight:lineHeight,
            fontScale: fontScale
        };

    };

    // Module exports
    cornerstoneCore.drawImage = drawImage;
    cornerstoneCore.setToPixelCoordinateSystem = setToPixelCoordinateSystem;
    cornerstoneCore.setToFontCoordinateSystem = setToFontCoordinateSystem;

    return cornerstoneCore;
}(cornerstoneCore));