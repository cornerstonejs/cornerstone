(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // For uint8 pack into alpha channel
    var shader = {
        format: 'ALPHA'
    };

    function storedPixelDataToImageData(pixelData) {
        // Transfer image data to alpha channel of WebGL texture
        // Store data in Uint8Array
        var data = new Uint8Array(pixelData.length);
        for (var i = 0; i < pixelData.length; i++) {
            data[i] = parseInt(pixelData[i], 10);
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
        'uniform vec2 u_wl;' +
        'uniform vec2 u_slopeIntercept;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
            'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +

            'float intensity = packedTextureElement.a * 256.0;'+
            'float rescaleSlope = float(u_slopeIntercept[0]);'+
            'float rescaleIntercept = float(u_slopeIntercept[1]);'+
            'float ww = u_wl[1];'+
            'float wc = u_wl[0];'+

            'intensity = intensity * rescaleSlope + rescaleIntercept;'+
            'float lower_bound = (ww * -0.5) + wc; '+
            'float upper_bound = (ww *  0.5) + wc; '+
            'float center0 = wc - 0.5;'+
            //'center0 -= minPixelValue;'+

            'float width0 = ww - 1.0;'+
            'intensity = (intensity - center0) / width0 + 0.5;'+

            // RGBA output
            'gl_FragColor = vec4(intensity, intensity, intensity, 1);' +
        '}';

    cornerstone.shaders.uint8 = shader;

}(cornerstone));