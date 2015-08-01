(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    if (!cornerstone.shaders.rgb) {
        cornerstone.shaders.rgb = {};
    }

    function storedColorPixelDataToCanvasImageData(image, lut) {
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        var numPixels = image.width * image.height * 4;
        var storedPixelData = image.getPixelData();
        var localLut = lut;
        var localCanvasImageDataData = new Uint8Array(numPixels);
        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        if (minPixelValue < 0){
            while (storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // green
                localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex] + (-minPixelValue)]; // blue
                storedPixelDataIndex+=2;
                canvasImageDataIndex+=2;
            }
        } else {
            while (storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // green
                localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex]]; // blue
                storedPixelDataIndex+=2;
                canvasImageDataIndex+=2;
            }
        }
        return localCanvasImageDataData;
    }


    cornerstone.shaders.rgb.storedColorPixelDataToCanvasImageData = storedColorPixelDataToCanvasImageData;

    cornerstone.shaders.rgb.vert = 'attribute vec2 a_position;' +
        'attribute vec2 a_texCoord;' +
        'uniform vec2 u_resolution;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
            'vec2 zeroToOne = a_position / u_resolution;' +
            'vec2 zeroToTwo = zeroToOne * 2.0;' +
            'vec2 clipSpace = zeroToTwo - 1.0;' +
            'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
            'v_texCoord = a_texCoord;' +
        '}';

    cornerstone.shaders.rgb.frag = 'precision mediump float;' +
        'uniform sampler2D u_image;' +
        'uniform vec2 u_wl;' +
        'uniform vec2 u_slopeIntercept;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
            'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +
            // unpacking [ [uint8, uint8, ~, ~]] -> float and compute slope intercept
            //'float grayLevel = (packedTextureElement[0]*255.0) * u_slopeIntercept[0] + u_slopeIntercept[1];' +
            // W/L transformation.
            //'float grayLevel_wl = clamp( ( grayLevel - u_wl[0] ) / (u_wl[1] - u_wl[0]), 0.0, 1.0);' +
            // RGBA output'
            //'gl_FragColor = vec4(grayLevel_wl, grayLevel_wl, grayLevel_wl, 1);' +
            'gl_FragColor = vec4(packedTextureElement[0], packedTextureElement[1], packedTextureElement[2], 1);' +
        '}';

}(cornerstone));