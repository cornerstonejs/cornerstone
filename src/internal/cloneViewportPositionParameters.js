// Create a copy of the properties that will be cached when syncing viewports
export default function (viewport) {
  return {
    rotation: viewport.rotation,
    scale: viewport.scale,
    translation: {
      x: viewport.translation.x,
      y: viewport.translation.y
    }
  };
}
