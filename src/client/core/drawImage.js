
var cornerstoneCore = (function (cornerstoneCore) {
    if(cornerstoneCore === undefined) {
        cornerstoneCore = {};
    }

    var renderCanvas = document.createElement('canvas')
    renderCanvas.width = 1024;
    renderCanvas.height = 1024;

    function drawDebugOverlays(ee, context)
    {
        var lineHeight = 25;
        var y = 30;

        //draw some overlay stuff
        context.fillStyle = 'white';
        context.fillText(ee.ids.studyId, 10, y);
        y+=lineHeight;
        context.fillText(ee.ids.imageId, 10, y);
        y+=lineHeight;
        for(var property in ee.viewport) {
            var str = property + ' = ' + ee.viewport[property];
            context.fillText(str, 10, y);
            y+=lineHeight;
        }
    };

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
        context.drawImage(renderCanvas, -image.columns / 2, -image.rows / 2);
        context.restore();

        //drawDebugOverlays(ee, context);
    };


    // Module exports
    cornerstoneCore.drawImage = drawImage;

    return cornerstoneCore;
}(cornerstoneCore));