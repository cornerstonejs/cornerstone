import { renderColorImage } from './renderColorImage.js';
import { renderGrayscaleImage } from './renderGrayscaleImage.js';
import { renderWebImage } from './renderWebImage.js';
import { renderPseudoColorImage } from './renderPseudoColorImage.js';
import { renderLabelMapImage } from './renderLabelMapImage.js';

/**
 * @module rendering
 */
export default {
  colorImage: renderColorImage,
  grayscaleImage: renderGrayscaleImage,
  webImage: renderWebImage,
  pseudoColorImage: renderPseudoColorImage,
  labelMapImage: renderLabelMapImage
};
