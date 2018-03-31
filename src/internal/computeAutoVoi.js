/**
 * Computes the VOI to display all the pixels if no VOI LUT data (Window Width/Window Center or voiLUT) exists on the viewport object.
 *
 * @param {Viewport} viewport - Object containing the viewport properties
 * @param {Object} image An Image loaded by a Cornerstone Image Loader
 * @returns {void}
 * @memberof Internal
 */
export default function computeAutoVoi (viewport, image) {
  if (hasVoi(viewport)) {
    return;
  }

  const maxVoi = image.maxPixelValue * image.slope + image.intercept;
  const minVoi = image.minPixelValue * image.slope + image.intercept;
  const ww = maxVoi - minVoi;
  const wc = (maxVoi + minVoi) / 2;

  if (viewport.voi === undefined) {
    viewport.voi = {
      windowWidth: ww,
      windowCenter: wc
    };
  } else {
    viewport.voi.windowWidth = ww;
    viewport.voi.windowCenter = wc;
  }
}

/**
 * Check if viewport has voi LUT data
 * @param {any} viewport The viewport to check for voi LUT data
 * @returns {Boolean} true viewport has LUT data (Window Width/Window Center or voiLUT). Otherwise, false.
 * @memberof Internal
 */
function hasVoi (viewport) {
  const hasLut = viewport.voiLUT && viewport.voiLUT.lut && viewport.voiLUT.lut.length > 0;

  return hasLut || (viewport.voi.windowWidth !== undefined && viewport.voi.windowCenter !== undefined);
}
