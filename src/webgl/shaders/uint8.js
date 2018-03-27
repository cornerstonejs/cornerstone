const uint8Shader = {};

/**
 * Convert stored pixel data to image data. Here we will store
 * all data in the alpha channel.
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Array} lut Lookup table to apply to the image pixel data
 * @returns {Uint8Array} The image data for use by the WebGL shader
 * @memberof WebGLRendering
 */
function storedPixelDataToImageData (image, mlutfn, vlutfn) {
  // Transfer image data to alpha channel of WebGL texture

  if (mlutfn || vlutfn) {
    const pixelData = image.getPixelData();
    const data = new Uint8Array(pixelData.length);

    for (let i = 0; i < pixelData.length; i++) {
      var sv = pixelData[i];

      if (image.photometricInterpretation === "MONOCHROME1") {
        sv = image.maxPixelValue - sv;
      }

      if (mlutfn) {
        sv = mlutfn(sv);
      }

      if (vlutfn) {
        sv = vlutfn(sv);
      }

      data[i] = sv;
    }

    return data;
  } else if (image.photometricInterpretation === "MONOCHROME1") {
    image.getPixelData().map(function(sv) { return image.maxPixelValue - sv; });
  }

  return image.getPixelData();
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
