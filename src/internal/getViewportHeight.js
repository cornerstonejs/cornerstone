/**
 * @return {Number} representing the effective height of the displayed area
 */
export default function (viewport) {
  return Math.abs(viewport.displayedArea.brhc.y - viewport.displayedArea.tlhc.y);
}
