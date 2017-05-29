const rgbShader = {};

/**
 * Convert stored pixel data to image data.
 *
 * Pack RGB images into a 3-channel RGB texture
 *
 * @param {Image} image A Cornerstone Image Object
 * @returns {Uint8Array} The image data for use by the WebGL shader
 */
function storedPixelDataToImageData (image) {
  const minPixelValue = image.minPixelValue;
  let canvasImageDataIndex = 0;
  let storedPixelDataIndex = 0;
    // Only 3 channels, since we use WebGL's RGB texture format
  const numStoredPixels = image.width * image.height * 4;
  const numOutputPixels = image.width * image.height * 3;
  const storedPixelData = image.getPixelData();
  const data = new Uint8Array(numOutputPixels);

    // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
    // We have a special code path for this case that improves performance.  Thanks to @jpambrun for this enhancement
  if (minPixelValue < 0) {
    while (storedPixelDataIndex < numStoredPixels) {
      data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // Red
      data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // Green
      data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++] + (-minPixelValue); // Blue
      storedPixelDataIndex += 1; // The stored pixel data has 4 channels
    }
  } else {
    while (storedPixelDataIndex < numStoredPixels) {
      data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // Red
      data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // Green
      data[canvasImageDataIndex++] = storedPixelData[storedPixelDataIndex++]; // Blue
      storedPixelDataIndex += 1; // The stored pixel data has 4 channels
    }
  }

  return data;
}

export const rgbDataUtilities = {
  storedPixelDataToImageData
};

rgbShader.frag = 'precision mediump float;' +
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
        'float center0 = wc - 0.5 - minPixelValue;' +
        'float width0 = max(ww, 1.0);' +
        'color = (color - center0) / width0 + 0.5;' +

        // RGBA output
        'gl_FragColor = vec4(color, 1);' +

        // Apply any inversion necessary
        'if (invert == 1)' +
            'gl_FragColor.rgb = 1. - gl_FragColor.rgb;' +
    '}';

export { rgbShader };
