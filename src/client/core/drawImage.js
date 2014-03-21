
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
        context.translate(ee.canvas.width/2, ee.canvas.height / 2);
        context.scale(ee.viewport.scale, ee.viewport.scale);
        context.translate(ee.viewport.centerX,ee.viewport.centerY);

        // draw the image
        image.windowCenter = ee.viewport.windowCenter;
        image.windowWidth = ee.viewport.windowWidth;
        var lut = cornerstoneCore.generateLut(image);
        var renderCanvasContext = renderCanvas.getContext("2d");
        var imageData = renderCanvasContext.createImageData(image.columns, image.rows);
        cornerstoneCore.storedPixelDataToCanvasImageData(image, lut, imageData.data);
        renderCanvasContext.putImageData(imageData, 0, 0);
        context.drawImage(renderCanvas, 0,0, image.columns, image.rows, -image.columns / 2, -image.rows / 2, image.columns, image.rows);


        context.translate(-image.columns/2, -image.rows /2);
        var event = new CustomEvent(
            "CornerstoneImageRendered",
            {
                detail: {
                    canvasContext: context,
                    viewport: ee.viewport,
                    element: ee.element,
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