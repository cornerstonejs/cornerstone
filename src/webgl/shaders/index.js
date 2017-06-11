import { int16Shader, int16DataUtilities } from './int16.js';
import { int8Shader, int8DataUtilities } from './int8.js';
import { rgbShader, rgbDataUtilities } from './rgb.js';
import { uint16Shader, uint16DataUtilities } from './uint16.js';
import { uint8Shader, uint8DataUtilities } from './uint8.js';

const shaders = {
  int16: int16Shader,
  int8: int8Shader,
  rgb: rgbShader,
  uint16: uint16Shader,
  uint8: uint8Shader
};

const dataUtilities = {
  int16: int16DataUtilities,
  int8: int8DataUtilities,
  rgb: rgbDataUtilities,
  uint16: uint16DataUtilities,
  uint8: uint8DataUtilities
};

export { shaders, dataUtilities };
