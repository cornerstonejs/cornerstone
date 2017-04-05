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

    var shader = {};

    function storedPixelDataToImageData(image) {
        // Transfer image data to alpha channel of WebGL texture
        // Store data in Uint8Array
        var pixelData = image.getPixelData();
        var numberOfChannels = 2;
        var data = new Uint8Array(image.width * image.height * numberOfChannels);
        var offset = 0;

        for (var i = 0; i < pixelData.length; i++) {
            data[offset++] = parseInt(pixelData[i], 10);
            data[offset++] = pixelData[i] < 0 ? 0: 1; // 0 For negative, 1 for positive
        }
        return data;
    }

    cornerstone.webGL.dataUtilities.int8 = {
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
            'vec4 color = texture2D(u_image, v_texCoord);' +

            // Calculate luminance from packed texture
            'float intensity = color.r*256.;'+

            'if (color.a == 0.0)' +
                'intensity = -intensity;' +

            // Rescale based on slope and window settings
            'intensity = intensity * slope + intercept;'+
            'float center0 = wc - 0.5;'+
            'float width0 = max(ww, 1.0);' +
            'intensity = (intensity - center0) / width0 + 0.5;'+

            // Clamp intensity
            'intensity = clamp(intensity, 0.0, 1.0);' +

            // RGBA output
            'gl_FragColor = vec4(intensity, intensity, intensity, 1.0);' +

            // Apply any inversion necessary
            'if (invert == 1)' +
                'gl_FragColor.rgb = 1.0 - gl_FragColor.rgb;' +
        '}';

    cornerstone.webGL.shaders.int8 = shader;


}(cornerstone));