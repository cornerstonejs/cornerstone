/* eslint no-bitwise: 0 */

import { shaders, dataUtilities } from './shaders/index.js';
import { vertexShader } from './vertexShader.js';
import textureCache from './textureCache.js';
import createProgramFromString from './createProgramFromString.js';

const renderCanvas = document.createElement('canvas');
let gl;
let texCoordBuffer;
let positionBuffer;
let isWebGLInitialized = false;

export { isWebGLInitialized };

export function getRenderCanvas () {
  return renderCanvas;
}

function initShaders () {
  for (const id in shaders) {
        // Console.log("WEBGL: Loading shader", id);
    const shader = shaders[id];

    shader.attributes = {};
    shader.uniforms = {};
    shader.vert = vertexShader;

    shader.program = createProgramFromString(gl, shader.vert, shader.frag);

    shader.attributes.texCoordLocation = gl.getAttribLocation(shader.program, 'a_texCoord');
    gl.enableVertexAttribArray(shader.attributes.texCoordLocation);

    shader.attributes.positionLocation = gl.getAttribLocation(shader.program, 'a_position');
    gl.enableVertexAttribArray(shader.attributes.positionLocation);

    shader.uniforms.resolutionLocation = gl.getUniformLocation(shader.program, 'u_resolution');
  }
}

export function initRenderer () {
  if (isWebGLInitialized === true) {
        // Console.log("WEBGL Renderer already initialized");
    return;
  }

  if (initWebGL(renderCanvas)) {
    initBuffers();
    initShaders();
        // Console.log("WEBGL Renderer initialized!");
    isWebGLInitialized = true;
  }
}

function updateRectangle (gl, width, height) {
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    width, height,
    0, height,
    width, 0,
    0, 0]), gl.STATIC_DRAW);
}

function handleLostContext (event) {
  event.preventDefault();
  console.warn('WebGL Context Lost!');
}

function handleRestoredContext (event) {
  event.preventDefault();
  isWebGLInitialized = false;
  textureCache.purgeCache();
  initRenderer();
    // Console.log('WebGL Context Restored.');
}

function initWebGL (canvas) {

  gl = null;
  try {
        // Try to grab the standard context. If it fails, fallback to experimental.
    const options = {
      preserveDrawingBuffer: true // Preserve buffer so we can copy to display canvas element
    };

        // ---------------- Testing purposes -------------
        // If (debug === true && WebGLDebugUtils) {
        //    RenderCanvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(renderCanvas);
        // }
        // ---------------- Testing purposes -------------

    gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);

        // Set up event listeners for context lost / context restored
    canvas.removeEventListener('webglcontextlost', handleLostContext, false);
    canvas.addEventListener('webglcontextlost', handleLostContext, false);

    canvas.removeEventListener('webglcontextrestored', handleRestoredContext, false);
    canvas.addEventListener('webglcontextrestored', handleRestoredContext, false);

  } catch (error) {
    throw new Error('Error creating WebGL context');
  }

    // If we don't have a GL context, give up now
  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser may not support it.');
    gl = null;
  }

  return gl;
}

function getImageDataType (image) {
  if (image.color) {
    return 'rgb';
  }

  let datatype = 'int';

  if (image.minPixelValue >= 0) {
    datatype = `u${datatype}`;
  }

  if (image.maxPixelValue > 255) {
    datatype += '16';
  } else {
    datatype += '8';
  }

  return datatype;
}

function getShaderProgram (image) {

  const datatype = getImageDataType(image);
    // We need a mechanism for
    // Choosing the shader based on the image datatype
    // Console.log("Datatype: " + datatype);

  if (shaders.hasOwnProperty(datatype)) {
    return shaders[datatype];
  }

  return shaders.rgb;
}

function generateTexture (image) {
  const TEXTURE_FORMAT = {
    uint8: gl.LUMINANCE,
    int8: gl.LUMINANCE_ALPHA,
    uint16: gl.LUMINANCE_ALPHA,
    int16: gl.RGB,
    rgb: gl.RGB
  };

  const TEXTURE_BYTES = {
    int8: 1, // Luminance
    uint16: 2, // Luminance + Alpha
    int16: 3, // RGB
    rgb: 3 // RGB
  };

  const imageDataType = getImageDataType(image);
  const format = TEXTURE_FORMAT[imageDataType];

    // GL texture configuration
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  const imageData = dataUtilities[imageDataType].storedPixelDataToImageData(image, image.width, image.height);

  gl.texImage2D(gl.TEXTURE_2D, 0, format, image.width, image.height, 0, format, gl.UNSIGNED_BYTE, imageData);

    // Calculate the size in bytes of this image in memory
  const sizeInBytes = image.width * image.height * TEXTURE_BYTES[imageDataType];
  const imageTexture = {
    texture,
    sizeInBytes
  };


  return imageTexture;

}

function getImageTexture (image) {
  let imageTexture = textureCache.getImageTexture(image.imageId);

  if (!imageTexture) {
        // Console.log("Generating texture for imageid: ", image.imageId);
    imageTexture = generateTexture(image);
    textureCache.putImageTexture(image, imageTexture);
  }

  return imageTexture.texture;
}

function initBuffers () {
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 1,
    0, 1,
    1, 0,
    0, 0
  ]), gl.STATIC_DRAW);


  texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 0.0
  ]), gl.STATIC_DRAW);
}

function renderQuad (shader, parameters, texture, width, height) {
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.viewport(0, 0, width, height);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shader.program);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(shader.attributes.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(shader.attributes.positionLocation, 2, gl.FLOAT, false, 0, 0);

  for (const key in parameters) {
    const uniformLocation = gl.getUniformLocation(shader.program, key);

    if (!uniformLocation) {
      continue;

      // Disabling this error for now since RGB requires minPixelValue
      // but the other shaders do not.
      // throw `Could not access location for uniform: ${key}`;
    }

    const uniform = parameters[key];

    const type = uniform.type;
    const value = uniform.value;

    if (type === 'i') {
      gl.uniform1i(uniformLocation, value);
    } else if (type === 'f') {
      gl.uniform1f(uniformLocation, value);
    } else if (type === '2f') {
      gl.uniform2f(uniformLocation, value[0], value[1]);
    }
  }

  updateRectangle(gl, width, height);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

}

export function render (enabledElement) {
    // Resize the canvas
  const image = enabledElement.image;

  renderCanvas.width = image.width;
  renderCanvas.height = image.height;

  const viewport = enabledElement.viewport;

    // Render the current image
  const shader = getShaderProgram(image);
  const texture = getImageTexture(image);
  const parameters = {
    u_resolution: { type: '2f',
      value: [image.width, image.height] },
    wc: { type: 'f',
      value: viewport.voi.windowCenter },
    ww: { type: 'f',
      value: viewport.voi.windowWidth },
    slope: { type: 'f',
      value: image.slope },
    intercept: { type: 'f',
      value: image.intercept },
    minPixelValue: { type: 'f',
      value: image.minPixelValue },
    invert: { type: 'i',
      value: viewport.invert ? 1 : 0 }
  };

  renderQuad(shader, parameters, texture, image.width, image.height);

  return renderCanvas;
}

export function isWebGLAvailable () {
    // Adapted from
    // http://stackoverflow.com/questions/9899807/three-js-detect-webgl-support-and-fallback-to-regular-canvas

  const options = {
    failIfMajorPerformanceCaveat: true
  };

  try {
    const canvas = document.createElement('canvas');


    return Boolean(window.WebGLRenderingContext) &&
            (canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options));
  } catch (e) {
    return false;
  }
}
