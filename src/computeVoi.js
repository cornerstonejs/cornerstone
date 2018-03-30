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
  const windowWidth = maxVoi - minVoi;
  const windowCenter = (maxVoi + minVoi) / 2;

  if (viewport.voi == undefined) {
     viewport.voi = {
        windowWidth: windowWidth,
        windowCenter: windowCenter
     };
  }
  else {
     viewport.voi.windowWidth = windowWidth;
     viewport.voi.windowCenter = windowCenter;
  }


  viewport.voiLUT = undefined;
}

function hasVoiPreset (viewport) {
  return typeof viewport.voi.voiPresets !== 'undefined' && viewport.voi.voiPresets.length > 0;
}

function hasVoi(viewport) {
   let hasLut = viewport.voiLUT && viewport.voiLUT.lut && viewport.voiLUT.lut.length > 0;

   return hasLut || (viewport.voi.windowWidth !== undefined && viewport.voi.windowCenter !== undefined);
}

/**
 * computes the voi from min/max if no VOI values (voiLut/ww,wc) or forceAuto is true. Or,
 * selects a viewport.voi.voiPresets that is specified in the optional voiPresetIndex parameter

 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 * @param {boolean} forceAuto true to force computing the VOI from min/max values
 * @param {number} voiPresetIndex (optional) - index of a voi preset in the viewport.voi.voiPresets. Ignored if forceAuto is true
 * @returns {void}
 */
export default function computeVoi (viewport, image, forceAuto, voiPresetIndex = undefined) {

   if (forceAuto) {
      // auto VOI
      computeAutoVoi(viewport, image);

      return;
   }
   
   if (typeof voiPresetIndex !== "undefined" && hasVoiPreset(viewport)) {

      const voiPreset = viewport.voi.voiPresets[voiPresetIndex];

      if (voiPreset !== undefined) {
         //keep old values as a state since user might only pass the voiLUT
         viewport.voi.windowWidth = (voiPreset.ww === undefined) ? viewport.voi.windowWidth : voiPreset.ww; 
         viewport.voi.windowCenter = (voiPreset.wc === undefined) ? viewport.voi.windowCenter : voiPreset.wc;

         //this always apply
         viewport.voiLUT = voiPreset.voiLUT ; 
      }
   }
   else if (!hasVoi(viewport)) {
      computeAutoVoi(viewport, image);
   }
}