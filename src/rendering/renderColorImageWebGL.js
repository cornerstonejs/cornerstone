/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    var colorRenderCanvas = document.createElement('canvas');
    var colorRenderCanvasContext;
    var colorRenderCanvasData;
    var gl;
    var program;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function getLut(image, viewport) {
        // if we have a cached lut and it has the right values, return it immediately
        if(image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function getShaderProgram(gl, shader) {
        if (!program) {
            program = cornerstone.rendering.initShaders(gl, shader.frag, shader.vert);
        }
        return program;
    }

    function initializeWebGLContext(enabledElement) {
        var image = enabledElement.image;

        // Resize the canvas
        colorRenderCanvas.width = image.width;
        colorRenderCanvas.height = image.height;

        // Start WebGL drawing
        var pixelData = image.getPixelData();

        // Get A WebGL context
        var canvas = enabledElement.canvas;
        gl = cornerstone.rendering.initWebGL(canvas);
        
        // Set the current shader
        var shader = cornerstone.shaders.rgb;
        program = getShaderProgram(gl, shader);

        gl.clearColor(0.5, 0.0, 0.0, 1.0);

        var width = image.width;
        var height = image.height;
        var format = gl.RGBA;

        // GL texture configuration
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        //var imageData = shader.storedPixelDataToImageData(pixelData, width, height);
        var viewport = enabledElement.viewport;
        var lut = getLut(image, viewport);
        var imageData = shader.storedColorPixelDataToCanvasImageData(image, lut);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, imageData);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // provide texture coordinates for the rectangle.
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Create a buffer for the position of the rectangle corners.
        var posbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        cornerstone.rendering.setRectangle(gl, 0, 0, width, height);
        return gl;
    }

    function doesImageNeedToBeRendered(enabledElement, image) {
        if (image.imageId !== lastRenderedImageId ||
            lastRenderedViewport.windowCenter !== enabledElement.viewport.voi.windowCenter ||
            lastRenderedViewport.windowWidth !== enabledElement.viewport.voi.windowWidth ||
            lastRenderedViewport.invert !== enabledElement.viewport.invert ||
            lastRenderedViewport.rotation !== enabledElement.viewport.rotation ||
            lastRenderedViewport.hflip !== enabledElement.viewport.hflip ||
            lastRenderedViewport.vflip !== enabledElement.viewport.vflip
            ) {
            return true;
        }
        return false;
    }

    function getWebGLContext(enabledElement, image, invalidated) {
        // apply the lut to the stored pixel data onto the render canvas
        if (doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
            return gl;
        }

        // If our render canvas does not match the size of this image reset it
        // NOTE: This might be inefficient if we are updating multiple images of different
        // sizes frequently.
        if (colorRenderCanvas.width !== image.width || colorRenderCanvas.height != image.height) {
            initializeWebGLContext(enabledElement);
        }
        return gl;
    }

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderColorImageWebGL(enabledElement, invalidated) {
        if (!enabledElement) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }

        var image = enabledElement.image;
        if (!image) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        var canvas = enabledElement.canvas;
        var shader = cornerstone.shaders.rgb;
        gl = getWebGLContext(enabledElement, image, invalidated);
        program = getShaderProgram(gl, shader);

        var width = image.width;
        var height = image.height;

        // set the resolution
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        // set initial window/level (vec2)
        var wlLocation = gl.getUniformLocation(program, "u_wl");
        gl.uniform2f(wlLocation, enabledElement.viewport.voi.windowCenter, enabledElement.viewport.voi.windowWidth);

        // set Slope Intercept (vec2)
        var siLocation = gl.getUniformLocation(program, "u_slopeIntercept");
        gl.uniform2f(siLocation, image.slope, image.intercept);

        // Do the actual rendering
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Save lastRendered information
        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
    }

    // Module exports
    cornerstone.rendering.grayscaleImageWebGL = renderColorImageWebGL;
    cornerstone.renderColorImageWebGL = renderColorImageWebGL;

}(cornerstone));
