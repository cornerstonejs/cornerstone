const uint8Shader = {};

/**
 * Convert stored pixel data to image data. Here we will store
 * all data in the alpha channel.
 *
 * @param {Image} image A Cornerstone Image Object
 * @returns {Uint8Array} The image data for use by the WebGL shader
 */
function storedPixelDataToImageData (image) {
    // Transfer image data to alpha channel of WebGL texture
    // Store data in Uint8Array
  const pixelData = image.getPixelData();
  const data = new Uint8Array(pixelData.length);

  for (let i = 0; i < pixelData.length; i++) {
    data[i] = parseInt(pixelData[i], 10);
  }

  return data;
}

export const uint8DataUtilities = {
  storedPixelDataToImageData
};

uint8Shader.frag = 'precision mediump float;' +
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
        'float intensity = color.r*256.0;' +

        // Rescale based on slope and window settings
        'intensity = intensity * slope + intercept;' +
        'float center0 = wc - 0.5;' +
        'float width0 = max(ww, 1.0);' +
        'intensity = (intensity - center0) / width0 + 0.5;' +

        // Clamp intensity
        'intensity = clamp(intensity, 0.0, 1.0);' +

        // RGBA output
        'gl_FragColor = vec4(intensity, intensity, intensity, 1.0);' +

        // Apply any inversion necessary
        'if (invert == 1)' +
            'gl_FragColor.rgb = 1.0 - gl_FragColor.rgb;' +
    '}';

export { uint8Shader };
