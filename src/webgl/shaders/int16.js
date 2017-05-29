/* eslint no-bitwise: 0 */

const int16Shader = {};

/**
 * Convert stored pixel data to image data.
 *
 * Pack int16 into three uint8 channels (r, g, b)
 *
 * @param {Image} image A Cornerstone Image Object
 * @returns {Uint8Array} The image data for use by the WebGL shader
 */
function storedPixelDataToImageData (image) {

  // Transfer image data to alpha and luminance channels of WebGL texture
  // Credit to @jpambrun and @fernandojsg

  // Pack int16 into three uint8 channels (r, g, b)
  const pixelData = image.getPixelData();
  const numberOfChannels = 3;
  const data = new Uint8Array(image.width * image.height * numberOfChannels);
  let offset = 0;

  for (let i = 0; i < pixelData.length; i++) {
    const val = Math.abs(pixelData[i]);

    data[offset++] = parseInt(val & 0xFF, 10);
    data[offset++] = parseInt(val >> 8, 10);
    data[offset++] = pixelData[i] < 0 ? 0 : 1; // 0 For negative, 1 for positive
  }

  return data;
}

export const int16DataUtilities = {
  storedPixelDataToImageData
};

int16Shader.frag = 'precision mediump float;' +
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
        'float intensity = color.r*256.0 + color.g*65536.0;' +

        'if (color.b == 0.0)' +
            'intensity = -intensity;' +

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

export { int16Shader };
