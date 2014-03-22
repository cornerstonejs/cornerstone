
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas')
    renderCanvas.width = 1024;
    renderCanvas.height = 1024;

    function drawImage(ee, image) {

        var context = ee.canvas.getContext('2d');

        // clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);

        // setup the viewport
        context.save();
        // move origin to center of canvas
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        // apply the scale
        context.scale(ee.viewport.scale, ee.viewport.scale);
        // apply the pan offset
        context.translate(ee.viewport.centerX,ee.viewport.centerY);

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

        var smallFontSize = Math.round(10 / scaler);
        var mediumFontSize = Math.round(16 / scaler);
        var largeFontSize = Math.round(20 / scaler);

        // Draw the render canvas half the image size (because we set origin to the middle of the canvas above)
        context.drawImage(renderCanvas, 0,0, image.columns, image.rows, -image.columns / 2, -image.rows / 2, image.columns, image.rows);

        // translate the origin back to the corner of the image so the event handlers can draw in image coordinate system
        context.translate(-image.columns/2, -image.rows /2);
        var event = new CustomEvent(
            "CornerstoneImageRendered",
            {
                detail: {
                    canvasContext: context,
                    viewport: ee.viewport,
                    image: ee.image,
                    element: ee.element,
                    smallFontSize: "" + smallFontSize + "px",
                    mediumFontSize: "" + mediumFontSize + "px",
                    largeFontSize: "" + largeFontSize + "px",
                },
                bubbles: false,
                cancelable: false
            }
        );
        ee.element.dispatchEvent(event);

        context.restore();
    };

    // Module exports
    cornerstoneCore.drawImage = drawImage;

    return cornerstoneCore;
}(cornerstoneCore));