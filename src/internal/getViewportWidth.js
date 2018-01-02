/**
 * @return {Number} representing the effective width of the displayed area
 */
export default function (viewport) {
  return Math.abs(viewport.displayedArea.brhc.x - viewport.displayedArea.tlhc.x);
}
