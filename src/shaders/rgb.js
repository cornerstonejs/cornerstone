(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // Pack RGB images into a 3-channel RGB texture
    var shader = {
        format: 'RGB'
    };

    function storedColorPixelDataToCanvasImageData(image) {
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        // Only 3 channels, since we use WebGL's RGB texture format
        var numPixels = image.width * image.height * 3;
        var storedPixelData = image.getPixelData();
        var localCanvasImageDataData = new Uint8Array(numPixels);

        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        if (minPixelValue < 0){
            while (storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // red
                localCanvasImageDataData[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // green
                localCanvasImageDataData[canvasImageDataIndex] = storedPixelData[storedPixelDataIndex] + (-minPixelValue); // blue
                storedPixelDataIndex += 2; // The stored pixel data has 4 channels
                canvasImageDataIndex += 1;
            }
        } else {
            while (storedPixelDataIndex < numPixels) {
                localCanvasImageDataData[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // red
                localCanvasImageDataData[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // green
                localCanvasImageDataData[canvasImageDataIndex] = storedPixelData[storedPixelDataIndex]; // blue
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
        'uniform float ww;' +
        'uniform float wc;' +
        'uniform float slope;' +
        'uniform float intercept;' +
        'uniform float minPixelValue;' +
        'uniform int invert;' +
        'varying vec2 v_texCoord;' +
        
        'void main() {' +
            
            // Get texture
            'vec3 color = texture2D(u_image, v_texCoord).xyz;' +

            // Rescale based on slope and intercept 
            'color = color * 256.0 * slope + intercept;' +
            
            // Apply window settings
            'float center0 = wc - 0.5 - minPixelValue;'+
            'float width0 = ww - 1.0;'+
            'color = (color - center0) / width0 + 0.5;'+

            // RGBA output
            'gl_FragColor = vec4(color, 1);' +

            // Apply any inversion necessary
            'if (invert == 1)' +
                'gl_FragColor.rgb = 1. - gl_FragColor.rgb;' +
        '}';

    cornerstone.shaders.rgb = shader;

}(cornerstone));