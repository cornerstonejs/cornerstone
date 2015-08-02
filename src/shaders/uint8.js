(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    // For uint8 pack into alpha channel
    var shader = {
        format: 6406 // Equivalent to gl.ALPHA
    };

    function storedPixelDataToImageData(pixelData, width, height) {
        var numberOfChannels = 4;
        var data = new Uint8Array(width * height * numberOfChannels);
        
        // ii+=4 iterates over each pixels, not components.
        for (var ii = 0; ii < data.length; ii+=4) {
            // ugly modulo magic to translate ii to image coordinate and concatenate.
            var x = Math.floor(ii/4)%width;
            var y = Math.floor(Math.floor(ii/4)/height);
            var val = pixelData[(y%width)*width+(x%height)];
            
            data[ii+0] = val;
            data[ii+1] = 0;
            data[ii+2] = 0;
            data[ii+3] = 0;
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
            // unpacking [ [uint8, uint8, ~, ~]] -> float and compute slope intercept
            'float grayLevel = (packedTextureElement[0]*255.0) * u_slopeIntercept[0] + u_slopeIntercept[1];' +
            // W/L transformation.
            'float grayLevel_wl = clamp( ( grayLevel - u_wl[0] ) / (u_wl[1] - u_wl[0]), 0.0, 1.0);' +
            // RGBA output'
            'gl_FragColor = vec4(grayLevel_wl, grayLevel_wl, grayLevel_wl, 1);' +
        '}';

    cornerstone.shaders.uint8 = shader;

}(cornerstone));