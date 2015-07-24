/*! cornerstone-wado-image-loader - v0.5.2 - 2015-08-03 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneWADOImageLoader */
//
// This is a cornerstone image loader for WADO requests.  It currently does not support compressed
// transfer syntaxes or big endian transfer syntaxes.  It will support implicit little endian transfer
// syntaxes but explicit little endian is strongly preferred to avoid any parsing issues related
// to SQ elements.  To request that the WADO object be returned as explicit little endian, append
// the following on your WADO url: &transferSyntax=1.2.840.10008.1.2.1
//

var cornerstoneWADOImageLoader = (function ($, cornerstone, cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }



    function isColorImage(photoMetricInterpretation)
    {
        if(photoMetricInterpretation === "RGB" ||
            photoMetricInterpretation === "PALETTE COLOR" ||
            photoMetricInterpretation === "YBR_FULL" ||
            photoMetricInterpretation === "YBR_FULL_422" ||
            photoMetricInterpretation === "YBR_PARTIAL_422" ||
            photoMetricInterpretation === "YBR_PARTIAL_420" ||
            photoMetricInterpretation === "YBR_RCT")
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    function createImageObject(dataSet, imageId, frame)
    {
        if(frame === undefined) {
            frame = 0;
        }

        // make the image based on whether it is color or not
        var photometricInterpretation = dataSet.string('x00280004');
        var isColor = isColorImage(photometricInterpretation);
        if(isColor === false) {
            return cornerstoneWADOImageLoader.makeGrayscaleImage(imageId, dataSet, dataSet.byteArray, photometricInterpretation, frame);
        } else {
            return cornerstoneWADOImageLoader.makeColorImage(imageId, dataSet, dataSet.byteArray, photometricInterpretation, frame);
        }
    }

    var multiFrameCacheHack = {};

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

        // build a url by parsing out the url scheme and frame index from the imageId
        var url = imageId;
        url = url.substring(9);
        var frameIndex = url.indexOf('frame=');
        var frame;
        if(frameIndex !== -1) {
            var frameStr = url.substr(frameIndex + 6);
            frame = parseInt(frameStr);
            url = url.substr(0, frameIndex-1);
        }

        // if multiframe and cached, use the cached data set to extract the frame
        if(frame !== undefined &&
            multiFrameCacheHack.hasOwnProperty(url))
        {
            var dataSet = multiFrameCacheHack[url];
            var imagePromise = createImageObject(dataSet, imageId, frame);
            imagePromise.then(function(image) {
                deferred.resolve(image);
            }, function() {
                deferred.reject();
            });
            return deferred;
        }

        // Make the request for the DICOM data
        // TODO: consider using cujo's REST library here?
        var oReq = new XMLHttpRequest();
        oReq.open("get", url, true);
        oReq.responseType = "arraybuffer";
        //oReq.setRequestHeader("Accept", "multipart/related; type=application/dicom");

        oReq.onreadystatechange = function(oEvent) {
            // TODO: consider sending out progress messages here as we receive the pixel data
            if (oReq.readyState === 4)
            {
                if (oReq.status === 200) {
                    // request succeeded, create an image object and resolve the deferred

                    // Parse the DICOM File
                    var dicomPart10AsArrayBuffer = oReq.response;
                    var byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
                    var dataSet = dicomParser.parseDicom(byteArray);

                    // if multiframe, cache the parsed data set to speed up subsequent
                    // requests for the other frames
                    if(frame !== undefined) {
                        multiFrameCacheHack[url] = dataSet;
                    }

                    var imagePromise = createImageObject(dataSet, imageId, frame);
                    imagePromise.then(function(image) {
                        deferred.resolve(image);
                    }, function() {
                        deferred.reject();
                    });
                }
                // TODO: Check for errors and reject the deferred if they happened
                else {
                    // TODO: add some error handling here
                    // request failed, reject the deferred
                    deferred.reject();
                }
            }
        };
        oReq.onprogress = function(oProgress) {
            // console.log('progress:',oProgress)

            if (oProgress.lengthComputable) {  //evt.loaded the bytes browser receive
                //evt.total the total bytes seted by the header
                //
                var loaded = oProgress.loaded;
                var total = oProgress.total;
                var percentComplete = Math.round((loaded / total)*100);

                $(cornerstone).trigger('CornerstoneImageLoadProgress', {
                    imageId: imageId,
                    loaded: loaded,
                    total: total,
                    percentComplete: percentComplete
                });
            }
        };

        oReq.send();

        return deferred;
    }

    // steam the http and https prefixes so we can use wado URL's directly
    cornerstone.registerImageLoader('dicomweb', loadImage);

    return cornerstoneWADOImageLoader;
}($, cornerstone, cornerstoneWADOImageLoader));
/**
 */
var cornerstoneWADOImageLoader = (function (cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }

    function decodeRGB(rgbBuffer, rgbaBuffer) {
        if(rgbBuffer === undefined) {
            throw "decodeRGB: rgbBuffer must not be undefined";
        }
        if(rgbBuffer.length % 3 !== 0) {
            throw "decodeRGB: rgbBuffer length must be divisble by 3";
        }

        var numPixels = rgbBuffer.length / 3;
        var rgbIndex = 0;
        var rgbaIndex = 0;
        for(var i= 0; i < numPixels; i++) {
            rgbaBuffer[rgbaIndex++] = rgbBuffer[rgbIndex++]; // red
            rgbaBuffer[rgbaIndex++] = rgbBuffer[rgbIndex++]; // green
            rgbaBuffer[rgbaIndex++] = rgbBuffer[rgbIndex++]; // blue
            rgbaBuffer[rgbaIndex++] = 255; //alpha
        }

    }

    // module exports
    cornerstoneWADOImageLoader.decodeRGB = decodeRGB;

    return cornerstoneWADOImageLoader;
}(cornerstoneWADOImageLoader));
/**
 */
var cornerstoneWADOImageLoader = (function (cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }

    function decodeYBRFull(ybrBuffer, rgbaBuffer) {
        if(ybrBuffer === undefined) {
            throw "decodeRGB: ybrBuffer must not be undefined";
        }
        if(ybrBuffer.length % 3 !== 0) {
            throw "decodeRGB: ybrBuffer length must be divisble by 3";
        }

        var numPixels = ybrBuffer.length / 3;
        var ybrIndex = 0;
        var rgbaIndex = 0;
        for(var i= 0; i < numPixels; i++) {
            var y = ybrBuffer[ybrIndex++];
            var cb = ybrBuffer[ybrIndex++];
            var cr = ybrBuffer[ybrIndex++];
            rgbaBuffer[rgbaIndex++] = y + 1.40200 * (cr - 128);// red
            rgbaBuffer[rgbaIndex++] = y - 0.34414 * (cb -128) - 0.71414 * (cr- 128); // green
            rgbaBuffer[rgbaIndex++] = y + 1.77200 * (cb - 128); // blue
            rgbaBuffer[rgbaIndex++] = 255; //alpha
        }

    }

    // module exports
    cornerstoneWADOImageLoader.decodeYBRFull = decodeYBRFull;

    return cornerstoneWADOImageLoader;
}(cornerstoneWADOImageLoader));
var cornerstoneWADOImageLoader = (function (cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }

    function getPixelSpacing(dataSet)
    {
        // NOTE - these are not required for all SOP Classes
        // so we return them as undefined.  We also do not
        // deal with the complexity associated with projection
        // radiographs here and leave that to a higher layer
        var pixelSpacing = dataSet.string('x00280030');
        if(pixelSpacing && pixelSpacing.length > 0) {
            var split = pixelSpacing.split('\\');
            return {
                row: parseFloat(split[0]),
                column: parseFloat(split[1])
            };
        }
        else {
            return {
                row: undefined,
                column: undefined
            };
        }
    }
    // module exports
    cornerstoneWADOImageLoader.getPixelSpacing = getPixelSpacing;

    return cornerstoneWADOImageLoader;
}(cornerstoneWADOImageLoader));
var cornerstoneWADOImageLoader = (function (cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }

    function getRescaleSlopeAndIntercept(dataSet)
    {
        // NOTE - we default these to an identity transform since modality LUT
        // module is not required for all SOP Classes
        var result = {
            intercept : 0.0,
            slope: 1.0
        };

        //var rescaleIntercept  = dicomElements.x00281052;
        //var rescaleSlope  = dicomElements.x00281053;
        var rescaleIntercept = dataSet.floatString('x00281052');
        var rescaleSlope = dataSet.floatString('x00281053');

        if(rescaleIntercept ) {
            result.intercept = rescaleIntercept;
        }
        if(rescaleSlope ) {
            result.slope = rescaleSlope;
        }
        return result;
    }

    // module exports
    cornerstoneWADOImageLoader.getRescaleSlopeAndIntercept = getRescaleSlopeAndIntercept;

    return cornerstoneWADOImageLoader;
}(cornerstoneWADOImageLoader));
var cornerstoneWADOImageLoader = (function (cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }


    function getWindowWidthAndCenter(dataSet)
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

        var windowCenter = dataSet.floatString('x00281050');
        var windowWidth = dataSet.floatString('x00281051');

        if(windowCenter) {
            result.windowCenter = windowCenter;
        }
        if(windowWidth ) {
            result.windowWidth = windowWidth;
        }
        return result;
    }

    // module exports
    cornerstoneWADOImageLoader.getWindowWidthAndCenter = getWindowWidthAndCenter;

    return cornerstoneWADOImageLoader;
}(cornerstoneWADOImageLoader));
var cornerstoneWADOImageLoader = (function ($, cornerstone, cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }

    var canvas = document.createElement('canvas');
    var lastImageIdDrawn = "";

    function arrayBufferToString(buffer) {
        return binaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
    }

    function binaryToString(binary) {
        var error;

        try {
            return decodeURIComponent(escape(binary));
        } catch (_error) {
            error = _error;
            if (error instanceof URIError) {
                return binary;
            } else {
                throw error;
            }
        }
    }

    function extractStoredPixels(dataSet, byteArray, photometricInterpretation, width, height, frame) {
        canvas.height = height;
        canvas.width = width;

        var pixelDataElement = dataSet.elements.x7fe00010;
        var pixelDataOffset = pixelDataElement.dataOffset;
        var transferSyntax = dataSet.string('x00020010');

        var frameSize = width * height * 3;
        var frameOffset = pixelDataOffset + frame * frameSize;
        var encodedPixelData;// = new Uint8Array(byteArray.buffer, frameOffset);
        var context = canvas.getContext('2d');
        var imageData = context.createImageData(width, height);

        var deferred = $.Deferred();

        if (photometricInterpretation === "RGB") {
            encodedPixelData = new Uint8Array(byteArray.buffer, frameOffset, frameSize);
            cornerstoneWADOImageLoader.decodeRGB(encodedPixelData, imageData.data);
            deferred.resolve(imageData);
            return deferred;
        }
        else if (photometricInterpretation === "YBR_FULL")
        {
            encodedPixelData = new Uint8Array(byteArray.buffer, frameOffset, frameSize);
            cornerstoneWADOImageLoader.decodeYBRFull(encodedPixelData, imageData.data);
            deferred.resolve(imageData);
            return deferred;
        }
        else if(photometricInterpretation === "YBR_FULL_422" &&
                transferSyntax === "1.2.840.10008.1.2.4.50")
        {
            encodedPixelData = dicomParser.readEncapsulatedPixelData(dataSet, dataSet.elements.x7fe00010, frame);
            // need to read the encapsulated stream here i think
            var imgBlob = new Blob([encodedPixelData], {type: "image/jpeg"});
            var r = new FileReader();
            if(r.readAsBinaryString === undefined) {
                r.readAsArrayBuffer(imgBlob);
            }
            else {
                r.readAsBinaryString(imgBlob); // doesn't work on IE11
            }
            r.onload = function(){
                var img=new Image();
                img.onload = function() {
                    context.drawImage(this, 0, 0);
                    imageData = context.getImageData(0, 0, width, height);
                    deferred.resolve(imageData);
                };
                img.onerror = function(z) {
                    deferred.reject();
                };
                if(r.readAsBinaryString === undefined) {
                    img.src = "data:image/jpeg;base64,"+window.btoa(arrayBufferToString(r.result));
                }
                else {
                    img.src = "data:image/jpeg;base64,"+window.btoa(r.result); // doesn't work on IE11
                }

            };
            return deferred;
        }
        throw "no codec for " + photometricInterpretation;
    }

    function makeColorImage(imageId, dataSet, byteArray, photometricInterpretation, frame) {

        // extract the DICOM attributes we need
        var pixelSpacing = cornerstoneWADOImageLoader.getPixelSpacing(dataSet);
        var rows = dataSet.uint16('x00280010');
        var columns = dataSet.uint16('x00280011');
        var rescaleSlopeAndIntercept = cornerstoneWADOImageLoader.getRescaleSlopeAndIntercept(dataSet);
        var bytesPerPixel = 4;
        var numPixels = rows * columns;
        var sizeInBytes = numPixels * bytesPerPixel;
        var windowWidthAndCenter = cornerstoneWADOImageLoader.getWindowWidthAndCenter(dataSet);

        var deferred = $.Deferred();

        // Decompress and decode the pixel data for this image
        var imageDataPromise = extractStoredPixels(dataSet, byteArray, photometricInterpretation, columns, rows, frame);
        imageDataPromise.then(function(imageData) {
            function getPixelData() {
                return imageData.data;
            }

            function getImageData() {
                return imageData;
            }

            function getCanvas() {
                if(lastImageIdDrawn === imageId) {
                    return canvas;
                }

                canvas.height = rows;
                canvas.width = columns;
                var context = canvas.getContext('2d');
                context.putImageData(imageData, 0, 0 );
                lastImageIdDrawn = imageId;
                return canvas;
            }

            // Extract the various attributes we need
            var image = {
                imageId : imageId,
                minPixelValue : 0,
                maxPixelValue : 255,
                slope: rescaleSlopeAndIntercept.slope,
                intercept: rescaleSlopeAndIntercept.intercept,
                windowCenter : windowWidthAndCenter.windowCenter,
                windowWidth : windowWidthAndCenter.windowWidth,
                render: cornerstone.renderColorImage,
                getPixelData: getPixelData,
                getImageData: getImageData,
                getCanvas: getCanvas,
                rows: rows,
                columns: columns,
                height: rows,
                width: columns,
                color: true,
                columnPixelSpacing: pixelSpacing.column,
                rowPixelSpacing: pixelSpacing.row,
                data: dataSet,
                invert: false,
                sizeInBytes: sizeInBytes
            };

            if(image.windowCenter === undefined) {
                image.windowWidth = 255;
                image.windowCenter = 128;
            }
            deferred.resolve(image);
        }, function() {
            deferred.reject();
        });

        return deferred;
    }

    // module exports
    cornerstoneWADOImageLoader.makeColorImage = makeColorImage;

    return cornerstoneWADOImageLoader;
}($, cornerstone, cornerstoneWADOImageLoader));
var cornerstoneWADOImageLoader = (function ($, cornerstone, cornerstoneWADOImageLoader) {

    "use strict";

    if(cornerstoneWADOImageLoader === undefined) {
        cornerstoneWADOImageLoader = {};
    }

    function getPixelFormat(dataSet) {
        var pixelRepresentation = dataSet.uint16('x00280103');
        var bitsAllocated = dataSet.uint16('x00280100');
        if(pixelRepresentation === 0 && bitsAllocated === 8) {
            return 1; // unsigned 8 bit
        } else if(pixelRepresentation === 0 && bitsAllocated === 16) {
            return 2; // unsigned 16 bit
        } else if(pixelRepresentation === 1 && bitsAllocated === 16) {
            return 3; // signed 16 bit data
        }
    }

    function extractJPEG2000Pixels(dataSet, width, height, frame)
    {
        var compressedPixelData = dicomParser.readEncapsulatedPixelData(dataSet, dataSet.elements.x7fe00010, frame);
        var jpxImage = new JpxImage();
        jpxImage.parse(compressedPixelData);

        var j2kWidth = jpxImage.width;
        var j2kHeight = jpxImage.height;
        if(j2kWidth !== width) {
            throw 'JPEG2000 decoder returned width of ' + j2kWidth + ', when ' + width + ' is expected';
        }
        if(j2kHeight !== height) {
            throw 'JPEG2000 decoder returned width of ' + j2kHeight + ', when ' + height + ' is expected';
        }
        var componentsCount = jpxImage.componentsCount;
        if(componentsCount !== 1) {
            throw 'JPEG2000 decoder returned a componentCount of ' + componentsCount + ', when 1 is expected';
        }
        var tileCount = jpxImage.tiles.length;
        if(tileCount !== 1) {
            throw 'JPEG2000 decoder returned a tileCount of ' + tileCount + ', when 1 is expected';
        }
        var tileComponents = jpxImage.tiles[0];
        var pixelData = tileComponents.items;
        return pixelData;
    }

    function extractUncompressedPixels(dataSet, width, height, frame)
    {
        var pixelFormat = getPixelFormat(dataSet);
        var pixelDataElement = dataSet.elements.x7fe00010;
        var pixelDataOffset = pixelDataElement.dataOffset;
        var numPixels = width * height;
        // Note - we may want to sanity check the rows * columns * bitsAllocated * samplesPerPixel against the buffer size

        var frameOffset = 0;
        if(pixelFormat === 1) {
            frameOffset = pixelDataOffset + frame * numPixels;
            return new Uint8Array(dataSet.byteArray.buffer, frameOffset, numPixels);
        }
        else if(pixelFormat === 2) {
            frameOffset = pixelDataOffset + frame * numPixels * 2;
            return new Uint16Array(dataSet.byteArray.buffer, frameOffset, numPixels);
        }
        else if(pixelFormat === 3) {
            frameOffset = pixelDataOffset + frame * numPixels * 2;
            return new Int16Array(dataSet.byteArray.buffer, frameOffset, numPixels);
        }
    }

    function extractStoredPixels(dataSet, width, height, frame)
    {
        var transferSyntax = dataSet.string('x00020010');

        if(transferSyntax === "1.2.840.10008.1.2.4.90" || // JPEG 2000 lossless
            transferSyntax === "1.2.840.10008.1.2.4.91") // JPEG 2000 lossy
        {
            return extractJPEG2000Pixels(dataSet, width, height, frame);
        }

        return extractUncompressedPixels(dataSet, width, height, frame);
    }

    function getBytesPerPixel(dataSet)
    {
        var pixelFormat = getPixelFormat(dataSet);
        if(pixelFormat ===1) {
            return 1;
        }
        else if(pixelFormat ===2 || pixelFormat ===3){
            return 2;
        }
        throw "unknown pixel format";
    }

    function getMinMax(storedPixelData)
    {
        // we always calculate the min max values since they are not always
        // present in DICOM and we don't want to trust them anyway as cornerstone
        // depends on us providing reliable values for these
        var min = 65535;
        var max = -32768;
        var numPixels = storedPixelData.length;
        var pixelData = storedPixelData;
        for(var index = 0; index < numPixels; index++) {
            var spv = pixelData[index];
            // TODO: test to see if it is faster to use conditional here rather than calling min/max functions
            min = Math.min(min, spv);
            max = Math.max(max, spv);
        }

        return {
            min: min,
            max: max
        };
    }

    function makeGrayscaleImage(imageId, dataSet, byteArray, photometricInterpretation, frame) {

        // extract the DICOM attributes we need
        var pixelSpacing = cornerstoneWADOImageLoader.getPixelSpacing(dataSet);
        var rows = dataSet.uint16('x00280010');
        var columns = dataSet.uint16('x00280011');
        var rescaleSlopeAndIntercept = cornerstoneWADOImageLoader.getRescaleSlopeAndIntercept(dataSet);
        var bytesPerPixel = getBytesPerPixel(dataSet);
        var numPixels = rows * columns;
        var sizeInBytes = numPixels * bytesPerPixel;
        var invert = (photometricInterpretation === "MONOCHROME1");
        var windowWidthAndCenter = cornerstoneWADOImageLoader.getWindowWidthAndCenter(dataSet);

        // Decompress and decode the pixel data for this image
        var storedPixelData = extractStoredPixels(dataSet, columns, rows, frame);
        var minMax = getMinMax(storedPixelData);

        // Get the pixel format in a string to save as image.datatype
        // This is useful for determining which texture-packing method to use
        // in the WebGL renderer
        var pixelFormat = getPixelFormat(dataSet);
        var pixelFormats = {
            1: 'uint8',
            2: 'uint16',
            3: 'int16'
        };

        function getPixelData() {
            return storedPixelData;
        }

        // Extract the various attributes we need
        var image = {
            imageId : imageId,
            datatype: pixelFormats[pixelFormat],
            minPixelValue : minMax.min,
            maxPixelValue : minMax.max,
            slope: rescaleSlopeAndIntercept.slope,
            intercept: rescaleSlopeAndIntercept.intercept,
            windowCenter : windowWidthAndCenter.windowCenter,
            windowWidth : windowWidthAndCenter.windowWidth,
            render: cornerstone.renderGrayscaleImage,
            getPixelData: getPixelData,
            rows: rows,
            columns: columns,
            height: rows,
            width: columns,
            color: false,
            columnPixelSpacing: pixelSpacing.column,
            rowPixelSpacing: pixelSpacing.row,
            data: dataSet,
            invert: invert,
            sizeInBytes: sizeInBytes
        };

        // TODO: deal with pixel padding and all of the various issues by setting it to min pixel value (or lower)
        // TODO: Mask out overlays embedded in pixel data above high bit

        if(image.windowCenter === undefined) {
            var maxVoi = image.maxPixelValue * image.slope + image.intercept;
            var minVoi = image.minPixelValue * image.slope + image.intercept;
            image.windowWidth = maxVoi - minVoi;
            image.windowCenter = (maxVoi + minVoi) / 2;
        }

        var deferred = $.Deferred();
        deferred.resolve(image);
        return deferred;
    }

    // module exports
    cornerstoneWADOImageLoader.makeGrayscaleImage = makeGrayscaleImage;

    return cornerstoneWADOImageLoader;
}($, cornerstone, cornerstoneWADOImageLoader));