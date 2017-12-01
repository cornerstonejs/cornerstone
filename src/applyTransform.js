import triggerEvent from './triggerEvent.js';

function applyTransform (enabledElement) {
  console.time('applyTransform');
  const { element, image, viewport, canvas } = enabledElement;

  // Obtain the translation
  const { x, y } = viewport.translation;
  const cssTranslateX = x === 0 ? '-50%' : `calc(${x}px - 50%)`;
  const cssTranslateY = y === 0 ? '-50%' : `calc(${y}px - 50%)`;
  const translate = `translate(${cssTranslateX},${cssTranslateY})`;

  // We don't need to translate to center to apply scale/rotation thanks to transform-origin
  // heavy test for small optimisation ?
  let rotate = '';

  if (viewport.rotation % 360 !== 0) {
    rotate = `rotate(${viewport.rotation}deg)`;
  }

  // Use rotation for flip so we can animate it
  const vflipDegrees = viewport.vflip ? 180 : 0;
  const hflipDegrees = viewport.hflip ? 180 : 0;
  const flipX = `rotateX(${vflipDegrees}deg)`;
  const flipY = `rotateY(${hflipDegrees}deg)`;

  // Scale
  let widthScale = viewport.scale;
  let heightScale = viewport.scale;

  if (image) {
    if (image.rowPixelSpacing < image.columnPixelSpacing) {
      widthScale *= image.columnPixelSpacing / image.rowPixelSpacing;
    } else if (image.columnPixelSpacing < image.rowPixelSpacing) {
      heightScale *= image.rowPixelSpacing / image.columnPixelSpacing;
    }
  }

  const scale = `scale(${widthScale},${heightScale})`;

  canvas.style.transform = `${translate} ${rotate} ${flipX} ${flipY} ${scale}`;

  /*const detail = {
    viewport,
    element,
    image,
    enabledElement,
    canvasContext
  };*/

  //triggerEvent(element, 'cornerstonetransformupdated', detail);

  console.timeEnd('applyTransform');
}

// module exports
export default applyTransform;
