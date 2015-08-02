(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // For int16 pack uint16 into two uint8 channels (r and a)
    var shader = {
        format: 'LUMINANCE_ALPHA'
    };

    function storedPixelDataToImageData(pixelData, width, height) {
        // Transfer image data to alpha and luminance channels of WebGL texture
        // Credit to @jpambrun and @fernandojsg

        // Pack uint16 into two uint8 channels (r and a)
        var numberOfChannels = 2;
        var data = new Uint8Array(width * height * numberOfChannels);
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
        'uniform vec2 u_wl;' +
        'uniform vec2 u_slopeIntercept;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
            'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +

            'float intensity = packedTextureElement.r*256.0 + packedTextureElement.a*65536.0;'+
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

    cornerstone.shaders.int16 = shader;

}(cornerstone));