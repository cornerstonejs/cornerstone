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

  viewport.voiLUT = undefined;
}

function hasVoiPreset (viewport) {
  return typeof viewport.voi.voiPresets !== 'undefined' && viewport.voi.voiPresets.length > 0;
}

/**
 *  Computes the VOI to display image in viewport
 *
 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 *
 * @returns {void}
 */
// export default function computeVoi (viewport, image) {
//  if (viewport.computeVoi === undefined || image.computeVoi === undefined) {
//    return;
//  }

//  if (viewport.computeVoi.forceAutoVoi) {
//    // auto VOI
//    computeAutoVoi(viewport, image);

//    return;
//  }

//  if (viewport.computeVoi.type === 'FIXED') {
//    // If the VOI is fixed, we keep it
//    return;
//  }

//  // Reset the VOI
//  viewport.voi = {};
//  viewport.voiLUT = undefined;

//  // Check if a VOI preset is asked (viewport.computeVoi.voiPresetIndex) and stored in the dataSet (image.data.storedValues.voiPresetTab)
//  const voiPresetIndex = viewport.computeVoi.voiPresetIndex || 0;

//  if (image.data && image.data.storedValues && image.data.storedValues.voiPresetTab) {
//    const voiPresetTab = image.data.storedValues.voiPresetTab;

//    if (voiPresetTab[voiPresetIndex] !== undefined) {
//      viewport.voi.windowWidth = voiPresetTab[voiPresetIndex].ww;
//      viewport.voi.windowCenter = voiPresetTab[voiPresetIndex].wc;
//      viewport.voiLUT = voiPresetTab[voiPresetIndex].voiLUT;
//      viewport.computeVoi.type = 'IMAGE_PRESET';
//    }
//  }

//  if (viewport.voiLUT === undefined && (viewport.voi.windowWidth === undefined || viewport.voi.windowCenter === undefined)) {
//    // No valid VOI found => auto VOI
//    computeAutoVoi(viewport, image);
//  }
// }


/**
 * computes the voi from min/max if WW/WC are missing or forceAuto is true. Or,
 * selects a viewport.voi.voiPresets that is specified in the optional voiPresetIndex parameter

 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 * @param {boolean} forceAuto true to force computing the VOI from min/max values
 * @param {number} voiPresetIndex (optional) - index of a voi preset in the viewport.voi.voiPresets
 * @returns {void}
 */
export default function computeVoi (viewport, image, forceAuto, voiPresetIndex = undefined) {

  if (forceAuto || (viewport.voi.windowWidth === undefined || viewport.voi.windowCenter === undefined)) {
    // auto VOI
    computeAutoVoi(viewport, image);

    return;
  }
  else if (typeof voiPresetIndex !== "undefined" && hasVoiPreset (viewport)) {

    const voiPreset = viewport.voi.voiPresets[voiPresetIndex];
    
    if (voiPreset !== undefined) {
      viewport.voi.windowWidth = voiPreset[voiPresetIndex].ww;
      viewport.voi.windowCenter = voiPreset.wc;
      viewport.voiLUT = voiPreset.voiLUT;
    }
  }
}