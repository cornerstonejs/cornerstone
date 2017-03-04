/**
 * This module contains a function to get a default viewport for an image given
 * a canvas element to display it in
 *
 */

/**
 * Creates a new viewport object containing default values for the image and canvas
 * @param canvas
 * @param image
 * @returns viewport object
 */
export function getDefaultViewport(canvas, image) {
    if(canvas === undefined) {
        throw "getDefaultViewport: parameter canvas must not be undefined";
    }
    if(image === undefined) {
        throw "getDefaultViewport: parameter image must not be undefined";
    }
    var viewport = {
        scale : 1.0,
        translation : {
            x : 0,
            y : 0
        },
        voi : {
            windowWidth: image.windowWidth,
            windowCenter: image.windowCenter,
        },
        invert: image.invert,
        pixelReplication: false,
        rotation: 0,
        hflip: false,
        vflip: false,
        modalityLUT: image.modalityLUT,
        voiLUT: image.voiLUT
    };

    // fit image to window
    var verticalScale = canvas.height / image.rows;
    var horizontalScale= canvas.width / image.columns;
    if(horizontalScale < verticalScale) {
        viewport.scale = horizontalScale;
    }
    else {
        viewport.scale = verticalScale;
    }
    return viewport;
}
