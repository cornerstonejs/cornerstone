(function (cornerstone) {

    "use strict";

    if (!cornerstone.shaders) {
        cornerstone.shaders = {};
    }

    if (!cornerstone.shaders.int16) {
        cornerstone.shaders.int16 = {};
    }

    function storedPixelDataToImageData(pixelData, width, height) {
        // Transfer image data.
        // Some WebGL implementation supports floats components that could be used with medical images.
        // However, it rely a optional extension that is not supported by all hardware.
        // Furthermore, float textures have 4 channels (usually for RGBA) which means that each pixel requires
        // 16 bytes (4 floats32) of memory. To mitigate both issues, I have decided pack 16 bit in the 2 first
        // uint8 components (r and g). b and a are still available for other purposes.
        //
        // Credit to @jpambrun

        // Create texture, pack uint16 into two uint8 (r and g) and concatenate.
        var numberOfChannels = 4;
        var data = new Uint8Array(width * height * numberOfChannels);
        // ii+=4 iterates over each pixels, not components.
        for (var ii = 0; ii < data.length; ii+=4) {
            // ugly modulo magic to translate ii to image coordinate and concatenate.
            var x = Math.floor(ii/4)%width;
            var y = Math.floor(Math.floor(ii/4)/height);
            var val = pixelData[(y%512)*512+(x%512)];
            
            // uint16 -> [uint8, uint8, ~, ~]
            // Only unsigned is implemented. Shader will also need to support other formats.
            data[ii+0] = (val & 0x0000FF00) >> 8;
            data[ii+1] = (val & 0x000000FF);
            data[ii+2] = 0;
            data[ii+3] = 0;
        }
        return data;
    }

    cornerstone.shaders.int16.storedPixelDataToImageData = storedPixelDataToImageData;

    cornerstone.shaders.int16.vert = 'attribute vec2 a_position;' +
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

    cornerstone.shaders.int16.frag = 'precision mediump float;' +
        'uniform sampler2D u_image;' +
        'uniform vec2 u_wl;' +
        'uniform vec2 u_slopeIntercept;' +
        'varying vec2 v_texCoord;' +
        'void main() {' +
            'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +
            // unpacking [ [uint8, uint8, ~, ~]] -> float and compute slope intercept
            'float grayLevel = (packedTextureElement[0]*255.0*256.0 + packedTextureElement[1]*255.0) * u_slopeIntercept[0] + u_slopeIntercept[1];' +
            // W/L transformation.
            'float grayLevel_wl = clamp( ( grayLevel - u_wl[0] ) / (u_wl[1] - u_wl[0]), 0.0, 1.0);' +
            // RGBA output'
            'gl_FragColor = vec4(grayLevel_wl, grayLevel_wl, grayLevel_wl, 1);' +
        '}';

}(cornerstone));