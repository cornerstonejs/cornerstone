/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    var grayscaleRenderCanvas = document.createElement('canvas');
    var grayscaleRenderCanvasContext;
    var grayscaleRenderCanvasData;
    var gl;
    var program;
    var shader;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function getShaderProgram(gl, shader) {
        if (!program) {
            program = cornerstone.rendering.initShaders(gl, shader.frag, shader.vert);
        }
        return program;
    }

    function getShader(image) {
        if (!shader) {
            shader = cornerstone.rendering.getShader(image);
        }
        return shader;
    }
        
    function initializeWebGLContext(enabledElement) {
        var image = enabledElement.image;

        // Resize the canvas
        grayscaleRenderCanvas.width = image.width;
        grayscaleRenderCanvas.height = image.height;

        // Start WebGL drawing
        var pixelData = image.getPixelData();

        // Get A WebGL context
        gl = cornerstone.rendering.initWebGL(grayscaleRenderCanvas);
        
        if (!gl) {
            return;
        }

        // Set the current shader
        shader = getShader(image);
        program = getShaderProgram(gl, shader);

        gl.clearColor(0.5, 0.0, 0.0, 1.0);

        var width = image.width;
        var height = image.height;

        // Get the texture format for this datatype
        var format = gl[shader.format];

        // GL texture configuration
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var imageData = shader.storedPixelDataToImageData(pixelData, width, height);
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
        if (invalidated || grayscaleRenderCanvas.width !== image.width || grayscaleRenderCanvas.height != image.height) {
            initializeWebGLContext(enabledElement);
        }
        return gl;
    }

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invalidated and cached rendering should not be used
     */
    function renderGrayscaleImageWebGL(enabledElement, invalidated) {
        if (!enabledElement) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }

        var image = enabledElement.image;
        if (!image) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        // Get the canvas context and reset the transform
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        // Clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0,0, enabledElement.canvas.width, enabledElement.canvas.height);

        // Turn off image smooth/interpolation if pixelReplication is set in the viewport
        if (enabledElement.viewport.pixelReplication === true) {
            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false; // firefox doesn't support imageSmoothingEnabled yet
        } else {
            context.imageSmoothingEnabled = true;
            context.mozImageSmoothingEnabled = true;
        }

        shader = cornerstone.rendering.getShader(image);
        gl = getWebGLContext(enabledElement, image, invalidated);

        if (!gl) {
            return;
        }

        program = getShaderProgram(gl, shader);

        var width = image.width;
        var height = image.height;

        // set the resolution
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, width, height);

        // Pass window level to fragment shader
        var windowCenterLocation = gl.getUniformLocation(program, "wc");
        gl.uniform1f(windowCenterLocation, enabledElement.viewport.voi.windowCenter);
        
        // Pass window width to fragment shader
        var windowWidthLocation = gl.getUniformLocation(program, "ww");
        gl.uniform1f(windowWidthLocation, enabledElement.viewport.voi.windowWidth);

        // Pass slope to fragment shader
        var slopeLocation = gl.getUniformLocation(program, "slope");
        gl.uniform1f(slopeLocation, image.slope);

        // Pass intercept to fragment shader
        var interceptLocation = gl.getUniformLocation(program, "intercept");
        gl.uniform1f(interceptLocation, image.intercept);

        // Pass minPixelValue to fragment shader
        var minPixelValueLocation = gl.getUniformLocation(program, "minPixelValue");
        gl.uniform1f(minPixelValueLocation, image.minPixelValue);

        // Pass invert to fragment shader
        var invertLocation = gl.getUniformLocation(program, "invert");
        var invertAsInt = enabledElement.viewport.invert ? 1 : 0;
        gl.uniform1i(invertLocation, invertAsInt);

        // Do the actual rendering
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // save the canvas context state and apply the viewport properties
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        // Copy pixels from the offscreen canvas to the onscreen canvas
        context.drawImage(grayscaleRenderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);

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
    cornerstone.rendering.grayscaleImageWebGL = renderGrayscaleImageWebGL;
    cornerstone.renderGrayscaleImageWebGL = renderGrayscaleImageWebGL;

}(cornerstone));
