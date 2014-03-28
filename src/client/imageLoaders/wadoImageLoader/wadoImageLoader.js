//
// This is a cornerstone image loader for WADO requests.  It currently only supports WADO objects returned in
// explit little endian transfer syntax so the WADO URL should include &transferSyntax=1.2.840.10008.1.2.1
// if needed
//

(function ($, cornerstone) {

    function getPixelSpacing(dicomElements)
    {
        // NOTE - these are not required for all SOP Classes
        // so we return them as undefined.  We also do not
        // deal with the complexity associated with projection
        // radiographs here and leave that to a higher layer
        var pixelSpacingAttr  = dicomElements.x00280030;
        if(pixelSpacingAttr && pixelSpacingAttr.str.length > 0) {
            var split = pixelSpacingAttr.str.split('\\');
            var result =
            {
                row: parseFloat(split[0]),
                column: parseFloat(split[1])
            };
            return result;
        }
        else {
            var result =
            {
                row: undefined,
                column: undefined
            };
            return result;
        }
    }

    function getPixelFormat(dicomElements) {
        // NOTE - this should work for color images too - need to test
        var pixelRepresentation = dicomElements.x00280103.uint16;
        var bitsAllocated = dicomElements.x00280100.uint16;
        if(pixelRepresentation === 0 && bitsAllocated === 8) {
            return 1; // unsigned 8 bit
        } else if(pixelRepresentation === 0 && bitsAllocated === 16) {
            return 2; // unsigned 16 bit
        } else if(pixelRepresentation === 1 && bitsAllocated === 16) {
            return 3; // signed 16 bit data
        }
    }

    function extractStoredPixels(dicomElements, dicomPart10AsArrayBuffer)
    {
        var pixelFormat = getPixelFormat(dicomElements);
        var pixelDataElement = dicomElements.x7fe00010;
        var pixelDataOffset = pixelDataElement.dataOffset;

        // Note - we may want to sanity check the rows * columns * bitsAllocated * samplesPerPixel against the buffer size

        if(pixelFormat === 1) {
            return new Uint8Array(dicomPart10AsArrayBuffer, pixelDataOffset);
        }
        else if(pixelFormat === 2) {
            return new Uint16Array(dicomPart10AsArrayBuffer, pixelDataOffset);
        }
        else if(pixelFormat === 3) {
            return new Int16Array(dicomPart10AsArrayBuffer, pixelDataOffset);
        }
    }

    function getRescaleSlopeAndIntercept(dicomElements)
    {
        // NOTE - we default these to an identity transform since modality LUT
        // module is not required for all SOP Classes
        var result = {
            intercept : 0.0,
            slope: 1.0
        };

        var rescaleIntercept  = dicomElements.x00281052;
        var rescaleSlope  = dicomElements.x00281053;


        if(rescaleIntercept && rescaleIntercept.str.length > 0) {
            result.intercept = parseFloat(rescaleIntercept.str);
        }
        if(rescaleSlope && rescaleSlope.str.length > 0) {
            result.slope = parseFloat(rescaleSlope.str);
        }
        return result;
    }

    function getWindowWidthAndCenter(dicomElements)
    {
        // NOTE - Default these to undefined since they may not be present as
        // they are not present or required for all sop classes.  We leave it up
        // to a higher layer to determine reasonable default values for these
        // if they are not provided.  We also use the first ww/wc values if
        // there are multiple and again leave it up the higher levels to deal with
        // this
        var result = {
            windowCenter : undefined,
            windowWidth: undefined
        };

        var windowCenter  = dicomElements.x00281050;
        var windowWidth  = dicomElements.x00281051;

        if(windowCenter && windowCenter.str.length > 0) {
            var split = windowCenter.str.split('\\');
            result.windowCenter = parseFloat(split[0]);
        }
        if(windowWidth && windowWidth.str.length > 0) {
            var split = windowWidth.str.split('\\');
            result.windowWidth = parseFloat(split[0]);
        }
        return result;
    }

    function setMinMaxPixelValue(image)
    {
        // we always calculate the min max values since they are not always
        // present in DICOM and we don't want to trust them anyway as cornerstone
        // depends on us providing reliable values for these
        var min = 65535;
        var max = -32768;
        var numPixels = image.width * image.height;
        var pixelData = image.storedPixelData;
        for(var index = 0; index < numPixels; index++) {
            var spv = pixelData[index];
            // TODO: test to see if it is faster to use conditional here rather than calling min/max functions
            min = Math.min(min, spv);
            max = Math.max(max, spv);
        }

        image.minPixelValue = min;
        image.maxPixelValue = max;
    }

    function createImageObject(dicomPart10AsArrayBuffer)
    {
        // Parse the DICOM File
        var dicomElements = cornerstone.parseDicom(dicomPart10AsArrayBuffer);

        // extract the DICOM attributes we need
        var pixelSpacing = getPixelSpacing(dicomElements);
        var rows = dicomElements.x00280010.uint16;
        var columns = dicomElements.x00280010.uint16;
        var rescaleSlopeAndIntercept = getRescaleSlopeAndIntercept(dicomElements);
        var windowWidthAndCenter = getWindowWidthAndCenter(dicomElements);

        // Extract the various attributes we need
        var image = {
            minPixelValue : -32767, // calculated below
            maxPixelValue : 65535, // calculated below
            slope: rescaleSlopeAndIntercept.slope,
            intercept: rescaleSlopeAndIntercept.intercept,
            windowCenter : windowWidthAndCenter.windowCenter,
            windowWidth : windowWidthAndCenter.windowWidth,
            storedPixelData: extractStoredPixels(dicomElements, dicomPart10AsArrayBuffer),
            rows: rows,
            columns: columns,
            height: rows,
            width: columns,
            color: false,
            columnPixelSpacing: pixelSpacing.column,
            rowPixelSpacing: pixelSpacing.row,
            data: dicomElements
        };

        // TODO: deal with pixel padding and all of the various issues by setting it to min pixel value (or lower)
        // TODO: deal with MONOCHROME1 - either invert pixel data or add support to cornerstone
        // TODO: Add support for color by converting all formats to RGB
        // TODO: Mask out overlays embedded in pixel data above high bit

        setMinMaxPixelValue(image);

        return image;
    }

    // Loads an image given an imageId
    // wado url example:
    // http://localhost:3333/wado?requestType=WADO&studyUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075541.1&seriesUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075541.2&objectUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075557.1&contentType=application%2Fdicom&transferSyntax=1.2.840.10008.1.2.1
    // NOTE: supposedly the instance will be returned in Explicit Little Endian transfer syntax if you don't
    // specify a transferSyntax but Osirix doesn't do this and seems to return it with the transfer syntax it is
    // stored as.
    function loadImage(imageId) {
        // create a deferred object
        // TODO: Consider not using jquery for deferred - maybe cujo's when library
        var deferred = $.Deferred();

        // Make the request for the DICOM data
        // TODO: consider using cujo's REST library here?
        var oReq = new XMLHttpRequest();
        oReq.open("get", imageId, true);
        oReq.responseType = "arraybuffer";
        oReq.onreadystatechange = function(oEvent) {
            // TODO: consider sending out progress messages here as we receive the pixel data
            if(oReq.readyState == 4 && oReq.status == 200) {
                // request succeeded, create an image object and resolve the deferred
                // TODO: do error handling here in case something goes wrong parsing the response
                var image = createImageObject(oReq.response);

                deferred.resolve(image);
            }
            // TODO: Check for errors and reject the deferred if they happened
            else {
                // request failed, reject the deferred
                //deferred.reject();
            }
        };
        oReq.send();

        return deferred;
    }

    // steam the http and https prefixes so we can use wado URL's directly
    cornerstone.registerImageLoader('http', loadImage);
    cornerstone.registerImageLoader('https', loadImage);

    return cornerstone;
}($, cornerstone));