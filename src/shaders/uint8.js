(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // For uint8 pack into alpha channel
    var shader = {
//        format: 'ALPHA'
    };

    function storedPixelDataToImageData(image) {
        // Transfer image data to alpha channel of WebGL texture
        // Store data in Uint8Array
        var pixelData = image.getPixelData();
        var data = new Uint8Array(pixelData.length);
        for (var i = 0; i < pixelData.length; i++) {
            data[i] = parseInt(pixelData[i]/200, 10);
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
/*            'float intensity = color.a * 256.0;'+

            // Rescale based on slope and window settings
            'intensity = intensity * slope + intercept;'+
            'float center0 = wc - 0.5 - minPixelValue;'+
            'float width0 = ww - 1.0;'+
            'intensity = (intensity - center0) / width0 + 0.5;'+

            // Clamp intensity
            //'intensity = clamp(intensity, 0.0, 1.0);' +

            // RGBA output
            'gl_FragColor = vec4(1.0, 0.0, intensity, 1.0);' +

            // Apply any inversion necessary
            'if (invert == 1)' +
                'gl_FragColor.rgb = 1.0 - gl_FragColor.rgb;' +
                */
               
            'gl_FragColor = vec4(color.a,color.a,color.a,1.0);'+
        '}';

    cornerstone.shaders.uint8 = shader;


}(cornerstone));