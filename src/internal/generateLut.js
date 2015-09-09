/**
 * This module generates a lut for an image
 */

(function (cornerstone) {

  "use strict";

  function generateLinearModalityLUT(image) {
    var localSlope = image.slope;
    var localIntercept = image.intercept;
    return function(sp) {
      return sp * localSlope + localIntercept;
    }
  }

  function generateNonLinearModalityLUT(image, modalityLUT) {
    var minValue = modalityLUT.lut[0];
    var maxValue = modalityLUT.lut[modalityLUT.lut.length -1];
    var maxValueMapped = modalityLUT.firstValueMapped + modalityLUT.lut.length;
    return function(sp) {
      if(sp < modalityLUT.firstValueMapped) {
        return minValue;
      }
      else if(sp >= maxValueMapped)
      {
        return maxValue;
      }
      else
      {
        return modalityLUT.lut[sp];
      }
    }
  }
  function generateLinearVOILUT(windowWidth, windowCenter) {
    return function(modalityLutValue) {
      return (((modalityLutValue - (windowCenter)) / (windowWidth) + 0.5) * 255.0);
    }
  }

  function generateNonLinearVOILUT(image, voiLUT) {
    var shift = voiLUT.numBitsPerEntry - 8;
    var minValue = voiLUT.lut[0] >> shift;
    var maxValue = voiLUT.lut[voiLUT.lut.length -1] >> shift;
    var maxValueMapped = voiLUT.firstValueMapped + voiLUT.lut.length - 1;
    return function(modalityLutValue) {
      if(modalityLutValue < voiLUT.firstValueMapped) {
        return minValue;
      }
      else if(modalityLutValue >= maxValueMapped)
      {
        return maxValue;
      }
      else
      {
        return voiLUT.lut[modalityLutValue - voiLUT.firstValueMapped] >> shift;
      }
    }
  }

  function generateLutNew(image, windowWidth, windowCenter, invert, modalityLUT, voiLUT)
  {
    if(image.lut === undefined) {
      image.lut =  new Int16Array(image.maxPixelValue - Math.min(image.minPixelValue,0)+1);
    }
    var lut = image.lut;
    var maxPixelValue = image.maxPixelValue;
    var minPixelValue = image.minPixelValue;

    var mlutfn = modalityLUT ? generateNonLinearModalityLUT(image, modalityLUT) : generateLinearModalityLUT(image);
    var vlutfn = voiLUT ? generateNonLinearVOILUT(image, voiLUT) : generateLinearVOILUT(windowWidth, windowCenter);

    var offset = 0;
    if(minPixelValue < 0) {
      offset = minPixelValue;
    }
    var storedValue;
    var modalityLutValue;
    var voiLutValue;
    var clampedValue;

    for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
    {
      modalityLutValue = mlutfn(storedValue);
      voiLutValue = vlutfn(modalityLutValue);
      clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
      lut[storedValue+ (-offset)] = Math.round(clampedValue);
    }
    return lut;
  }



  /**
   * Creates a LUT used while rendering to convert stored pixel values to
   * display pixels
   *
   * @param image
   * @returns {Array}
   */
  function generateLut(image, windowWidth, windowCenter, invert, modalityLUT, voiLUT)
  {
    if(modalityLUT || voiLUT) {
      return generateLutNew(image, windowWidth, windowCenter, invert, modalityLUT, voiLUT);
    }

    if(image.lut === undefined) {
      image.lut =  new Int16Array(image.maxPixelValue - Math.min(image.minPixelValue,0)+1);
    }
    var lut = image.lut;

    var maxPixelValue = image.maxPixelValue;
    var minPixelValue = image.minPixelValue;
    var slope = image.slope;
    var intercept = image.intercept;
    var localWindowWidth = windowWidth;
    var localWindowCenter = windowCenter;
    var localModalityLUT = modalityLUT ? modalityLUT.lut : undefined;
    var localVOILUT = voiLUT ? voiLUT.lut : undefined;
    var modalityLutValue;
    var voiLutValue;
    var clampedValue;
    var storedValue;

    // NOTE: As of Nov 2014, most javascript engines have lower performance when indexing negative indexes.
    // We improve performance by offsetting the pixel values for signed data to avoid negative indexes
    // when generating the lut and then undo it in storedPixelDataToCanvasImagedata.  Thanks to @jpambrun
    // for this contribution!

    var offset = 0;
    if(minPixelValue < 0) {
      offset = minPixelValue;
    }

    if(invert === true) {
      for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
      {
        modalityLutValue = localModalityLUT ? localModalityLUT[storedValue] : storedValue * slope + intercept;
        voiLutValue = localVOILUT ? localVOILUT[modalityLutValue] : (((modalityLutValue - (localWindowCenter)) / (localWindowWidth) + 0.5) * 255.0);
        clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
        lut[storedValue + (-offset)] = Math.round(255 - clampedValue);
      }
    }
    else {
      for(storedValue = image.minPixelValue; storedValue <= maxPixelValue; storedValue++)
      {
        modalityLutValue = localModalityLUT ? localModalityLUT[storedValue] : storedValue * slope + intercept;
        voiLutValue = localVOILUT ? localVOILUT[modalityLutValue] : (((modalityLutValue - (localWindowCenter)) / (localWindowWidth) + 0.5) * 255.0);
        clampedValue = Math.min(Math.max(voiLutValue, 0), 255);
        lut[storedValue+ (-offset)] = Math.round(clampedValue);
      }
    }
  }


  // Module exports
  cornerstone.internal.generateLutNew = generateLutNew;
  cornerstone.internal.generateLut = generateLut;
  cornerstone.generateLutNew = generateLutNew;
  cornerstone.generateLut = generateLut;
}(cornerstone));
