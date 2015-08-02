(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // Pack RGB images into a 3-channel RGB texture
    var shader = {
        format: 'RGB'
    };

    function storedColorPixelDataToCanvasImageData(image, lut) {
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        // Only 3 channels, since we use WebGL's RGB texture format
        var numPixels = image.width * image.height * 3;
        var storedPixelData = image.getPixelData();
        var localLut = lut;
        var localCanvasImageDataData = new Uint8Array(numPixels);

        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        console.log(minPixelValue);
        if (minPixelValue < 0){
            while (storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++] + (-minPixelValue)]; // green
                localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex] + (-minPixelValue)]; // blue
                storedPixelDataIndex += 2; // The stored pixel data has 4 channels
                canvasImageDataIndex += 1;
            }
        } else {
            while (storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = localLut[storedPixelData[storedPixelDataIndex++]]; // green
                localCanvasImageDataData[canvasImageDataIndex] = localLut[storedPixelData[storedPixelDataIndex]]; // blue
                storedPixelDataIndex += 2; // The stored pixel data has 4 channels
                canvasImageDataIndex += 1;
            }
        }
        return localCanvasImageDataData;
    }

    shader.storedColorPixelDataToCanvasImageData = storedColorPixelDataToCanvasImageData;

    shader.vert = 'attribute vec2 a_position;' +
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

    shader.frag = 'precision mediump float;' +
        'uniform sampler2D u_image;' +
        'uniform vec2 u_wl;' +
        'uniform vec2 u_slopeIntercept;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
            'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +

            'float red = packedTextureElement.r;'+
            'float green = packedTextureElement.g;'+
            'float blue = packedTextureElement.b;'+

            // Need to fix application of window width/center
            
            /*'float rescaleSlope = float(u_slopeIntercept[0]);'+
            'float rescaleIntercept = float(u_slopeIntercept[1]);'+
            'float ww = u_wl[1];'+
            'float wc = u_wl[0];'+

            'red = red * rescaleSlope + rescaleIntercept;'+
            'green = green * rescaleSlope + rescaleIntercept;'+
            'blue = blue * rescaleSlope + rescaleIntercept;'+
            'float lower_bound = (ww * -0.5) + wc; '+
            'float upper_bound = (ww *  0.5) + wc; '+
            'float center0 = wc - 0.5;'+
            //'center0 -= minPixelValue;'+

            'float width0 = ww - 1.0;'+
            'red = (red - center0) / width0 + 0.5;'+
            'green = (green - center0) / width0 + 0.5;'+
            'blue = (blue - center0) / width0 + 0.5;'+*/

            // RGBA output
            'gl_FragColor = vec4(red, green, blue, 1);' +
        '}';

    cornerstone.shaders.rgb = shader;

}(cornerstone));