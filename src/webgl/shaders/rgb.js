(function (cornerstone) {

    "use strict";

    if (!cornerstone.webGL) {
        cornerstone.webGL = {};
    }

    if (!cornerstone.webGL.shaders) {
        cornerstone.webGL.shaders = {};
    }

    if (!cornerstone.webGL.dataUtilities) {
        cornerstone.webGL.dataUtilities = {};
    }

    // Pack RGB images into a 3-channel RGB texture
    var shader = {};

    function storedPixelDataToImageData(image) {
        var minPixelValue = image.minPixelValue;
        var canvasImageDataIndex = 0;
        var storedPixelDataIndex = 0;
        // Only 3 channels, since we use WebGL's RGB texture format
        var numStoredPixels = image.width * image.height * 4;
        var numOutputPixels = image.width * image.height * 3;
        var storedPixelData = image.getPixelData();
        var data = new Uint8Array(numOutputPixels);

        // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
        // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
        if (minPixelValue < 0){
            while (storedPixelDataIndex < numStoredPixels) {
                data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // red
                data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // green
                data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // blue
                storedPixelDataIndex += 1; // The stored pixel data has 4 channels
            }
        } else {
            while (storedPixelDataIndex < numStoredPixels) {
                data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // red
                data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // green
                data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // blue
                storedPixelDataIndex += 1; // The stored pixel data has 4 channels
            }
        }
        return data;
    }

    cornerstone.webGL.dataUtilities.rgb = {
        storedPixelDataToImageData: storedPixelDataToImageData
    };

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
            'float width0 = max(ww, 1.0);' +
            'color = (color - center0) / width0 + 0.5;'+

            // RGBA output
            'gl_FragColor = vec4(color, 1);' +
            
            // Apply any inversion necessary
            'if (invert == 1)' +
                'gl_FragColor.rgb = 1. - gl_FragColor.rgb;' +
        '}';

    cornerstone.webGL.shaders.rgb = shader;

}(cornerstone));