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

    // For uint16 pack uint16 into two uint8 channels (r and a)
    var shader = {};

    function storedPixelDataToImageData(image) {

        // Transfer image data to alpha and luminance channels of WebGL texture
        // Credit to @jpambrun and @fernandojsg

        // Pack uint16 into two uint8 channels (r and a)
        var pixelData = image.getPixelData();
        var numberOfChannels = 2;
        var data = new Uint8Array(image.width * image.height * numberOfChannels);
        var offset = 0;

        for (var i = 0; i < pixelData.length; i++) {
            var val = pixelData[i];
            data[offset++] = parseInt(val & 0xFF, 10);
            data[offset++] = parseInt(val >> 8, 10);
        }
        return data;
    }

    cornerstone.webGL.dataUtilities.uint16 = {
        storedPixelDataToImageData: storedPixelDataToImageData
    };

    shader.frag = 'precision mediump float;' +
        'uniform sampler2D u_image;' +
        'uniform float ww;' +
        'uniform float wc;' +
        'uniform float slope;' +
        'uniform float intercept;' +
        'uniform int invert;' +
        'varying vec2 v_texCoord;' +
        
        'void main() {' +
            // Get texture
            'vec4 color = texture2D(u_image, v_texCoord);' +

            // Calculate luminance from packed texture
            'float intensity = color.r*256.0 + color.a*65536.0;'+

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

    cornerstone.webGL.shaders.uint16 = shader;

}(cornerstone));