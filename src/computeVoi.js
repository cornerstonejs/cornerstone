/**
 * Computes the VOI to display all the pixels
 *
 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 *
 * @returns {void}
 */
function computeAutoVoi (viewport, image) {
  const maxVoi = image.maxPixelValue * image.slope + image.intercept;
  const minVoi = image.minPixelValue * image.slope + image.intercept;

  viewport.voi = {
    windowWidth: maxVoi - minVoi,
    windowCenter: (maxVoi + minVoi) / 2
  };

  viewport.computeVoi.type = 'AUTO';

  viewport.voiLUT = undefined;
}

/**
 *  Computes the VOI to display image in viewport
 *
 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 *
 * @returns {void}
 */
export default function computeVoi (viewport, image) {
  if (viewport.computeVoi === undefined || image.computeVoi === undefined) {
    return;
  }

  if (viewport.computeVoi.forceAutoVoi) {
    // auto VOI
    computeAutoVoi(viewport, image);

    return;
  }

  if (viewport.computeVoi.type === 'FIXED') {
    // If the VOI is fixed, we keep it
    return;
  }

  // Reset the VOI
  viewport.voi = {};
  viewport.voiLUT = undefined;

  // Check if a VOI preset is asked (viewport.computeVoi.voiPresetIndex) and stored in the dataSet (image.data.storedValues.voiPresetTab)
  const voiPresetIndex = viewport.computeVoi.voiPresetIndex || 0;

  if (image.data && image.data.storedValues && image.data.storedValues.voiPresetTab) {
    const voiPresetTab = image.data.storedValues.voiPresetTab;

    if (voiPresetTab[voiPresetIndex] !== undefined) {
      viewport.voi.windowWidth = voiPresetTab[voiPresetIndex].ww;
      viewport.voi.windowCenter = voiPresetTab[voiPresetIndex].wc;
      viewport.voiLUT = voiPresetTab[voiPresetIndex].voiLUT;
      viewport.computeVoi.type = 'IMAGE_PRESET';
    }
  }

  if (viewport.voiLUT === undefined && (viewport.voi.windowWidth === undefined || viewport.voi.windowCenter === undefined)) {
    // No valid VOI found => auto VOI
    computeAutoVoi(viewport, image);
  }
}
