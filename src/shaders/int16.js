(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // For int16 pack int16 into two uint8 channels (r and a)
    var shader = {
//        format: 'LUMINANCE_ALPHA'
    };

    function storedPixelDataToImageData(image) {

        // Transfer image data to alpha and luminance channels of WebGL texture
        // Credit to @jpambrun and @fernandojsg

        // Pack int16 into two uint8 channels (r and a)
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

    shader.storedPixelDataToImageData = storedPixelDataToImageData;

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
            'vec4 color = texture2D(u_image, v_texCoord);' +

            // Calculate luminance from packed texture
            'float intensity = color.r*256.0 + color.a*65536.0;'+

            // Rescale based on slope and window settings
            'intensity = intensity * slope + intercept;'+
            'float center0 = wc - 0.5 - minPixelValue;'+
            'float width0 = ww - 1.0;'+
            'intensity = (intensity - center0) / width0 + 0.5;'+

            // Clamp intensity
            'intensity = clamp(intensity, 0.0, 1.0);' +

            // RGBA output
            'gl_FragColor = vec4(intensity, intensity, intensity, 1.0);' +

            // Apply any inversion necessary
            'if (invert == 1)' +
                'gl_FragColor.rgb = 1.0 - gl_FragColor.rgb;' +
        '}';

    cornerstone.shaders.int16 = shader;
    cornerstone.shaders.uint16 = shader;

}(cornerstone));