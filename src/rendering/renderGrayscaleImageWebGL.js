/**
 * This module is responsible for drawing a grayscale image
 */

(function (cornerstone) {

    "use strict";

    var grayscaleRenderCanvas = document.createElement('canvas');
    var grayscaleRenderCanvasContext;
    var grayscaleRenderCanvasData;

    var lastRenderedImageId;
    var lastRenderedViewport = {};

    function initWebGL(canvas) {
        // TODO for cornerstone : use failIfMajorPerformanceCaveat to determine if fallback is required.
        //      https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2.1
        var gl = null;
        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        }
        catch(e) {}

        // If we don't have a GL context, give up now
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
            gl = null;
        }
        return gl;
    }

    function initShaders(gl) {
        // Create shader program
        var shaderProgram = gl.createProgram();

        // Create and attach the fragment Shader
        var fragShaderSrc = 'precision mediump float;' +
            'uniform sampler2D u_image;' +
            'uniform vec2 u_wl;' +
            'uniform vec2 u_slopeIntercept;' +
            'varying vec2 v_texCoord;' +
            'void main() {' +
                'vec4 packedTextureElement = texture2D(u_image, v_texCoord);' +
                // unpacking [ [uint8, uint8, ~, ~]] -> float and compute slope intercept
                'float grayLevel = (packedTextureElement[0]*255.0*256.0 + packedTextureElement[1]*255.0) * u_slopeIntercept[0] + u_slopeIntercept[1];' +
                // W/L transformation.
                'float grayLevel_wl = clamp( ( grayLevel - u_wl[0] ) / (u_wl[1] - u_wl[0]), 0.0, 1.0);' +
                // RGBA output'
                'gl_FragColor = vec4(grayLevel_wl, grayLevel_wl, grayLevel_wl, 1);' +
            '}';

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragShaderSrc);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw "An error occurred compiling the fragment shader";
        }
        gl.attachShader(shaderProgram, fragmentShader);

        // Create and attach the vertex shader
        var vertexShaderSrc = 'attribute vec2 a_position;' +
            'attribute vec2 a_texCoord;' +
            'uniform vec2 u_resolution;' +
            'varying vec2 v_texCoord;' +
            'void main() {' +
                'vec2 zeroToOne = a_position / u_resolution;' +
                'vec2 zeroToTwo = zeroToOne * 2.0;' +
                'vec2 clipSpace = zeroToTwo - 1.0;' +
                'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);' +
                'v_texCoord = a_texCoord;' +
            '}';

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSrc);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw "An error occurred compiling the vertex shader";
        }
        gl.attachShader(shaderProgram, vertexShader);

        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw "Unable to initialize the shader program.";
        }

        gl.useProgram(shaderProgram);
        return shaderProgram;
    }

    function render(gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    function setRectangle(gl, x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
              x1, y1,
              x2, y1,
              x1, y2,
              x1, y2,
              x2, y1,
              x2, y2]), gl.STATIC_DRAW);
    }

    function initializeGrayscaleRenderCanvas(image) {
        // Resize the canvas
        grayscaleRenderCanvas.width = image.width;
        grayscaleRenderCanvas.height = image.height;
    }

    function getLut(image, viewport, invalidated) {
        // if we have a cached lut and it has the right values, return it immediately
        if (image.lut !== undefined &&
            image.lut.windowCenter === viewport.voi.windowCenter &&
            image.lut.windowWidth === viewport.voi.windowWidth &&
            image.lut.invert === viewport.invert &&
            invalidated !== true) {
            return image.lut;
        }

        // lut is invalid or not present, regenerate it and cache it
        cornerstone.generateLut(image, viewport.voi.windowWidth, viewport.voi.windowCenter, viewport.invert);
        image.lut.windowWidth = viewport.voi.windowWidth;
        image.lut.windowCenter = viewport.voi.windowCenter;
        image.lut.invert = viewport.invert;
        return image.lut;
    }

    function doesImageNeedToBeRendered(enabledElement, image)
    {
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

    function getRenderCanvas(enabledElement, image, invalidated)
    {
        // apply the lut to the stored pixel data onto the render canvas
        if (doesImageNeedToBeRendered(enabledElement, image) === false && invalidated !== true) {
            return grayscaleRenderCanvas;
        }

        // If our render canvas does not match the size of this image reset it
        // NOTE: This might be inefficient if we are updating multiple images of different
        // sizes frequently.
        if (grayscaleRenderCanvas.width !== image.width || grayscaleRenderCanvas.height != image.height) {
            initializeGrayscaleRenderCanvas(image);
        }
        return grayscaleRenderCanvas;
    }

    /**
     * API function to draw a grayscale image to a given enabledElement
     * @param enabledElement
     * @param invalidated - true if pixel data has been invaldiated and cached rendering should not be used
     */
    function renderGrayscaleImageWebGL(enabledElement, invalidated) {

        if (!enabledElement) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }

        var image = enabledElement.image;
        if (!image) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        var renderCanvas = getRenderCanvas(enabledElement, image, invalidated);

        // Start WebGL drawing
        var pixelData = image.getPixelData();
        var width = image.width;
        var height = image.height;

        // Get A WebGL context
        var gl = initWebGL(renderCanvas);
        var program = initShaders(gl);
        gl.clearColor(0.5, 0.0, 0.0, 1.0);

        var numberOfChannels = 4;
        var format = gl.RGBA;
        
        // Transfer image data.
        // Some WebGL implementation supports floats components that could be used with medical images.
        // However, it rely a optional extension that is not supported by all hardware.
        // Furthermore, float textures have 4 channels (usually for RGBA) which means that each pixel requires
        // 16 bytes (4 floats32) of memory. To mitigate both issues, I have decided pack 16 bit in the 2 first
        // uint8 components (r and g). b and a are still available for other purposes.

        // GL texture configuration
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Create texture, pack uint16 into two uint8 (r and g) and concatenate.
        var data = new Uint8Array(width * height * numberOfChannels);
        // ii+=4 iterates over each pixels, not components.
        for (var ii = 0; ii < data.length; ii+=4) {
            // ugly modulo magic to translate ii to image coordinate and concatenate.
            var x = Math.floor(ii/4)%width;
            var y = Math.floor(Math.floor(ii/4)/height);

            var val = pixelData[(y%512)*512+(x%512)];
            // uint16 -> [uint8, uint8, ~, ~]
            // Only unsigned is implemented. Shader will also need to support other formats.
            data[ii+0] = (val & 0x0000FF00) >> 8;
            data[ii+1] = (val & 0x000000FF);
            data[ii+2] = 0;
            data[ii+4] = 0;
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, data);

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
        
        // set the resolution
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, renderCanvas.width, renderCanvas.height);
        
        // set initial window/level (vec2)
        var wlLocation = gl.getUniformLocation(program, "u_wl");
        gl.uniform2f(wlLocation, enabledElement.viewport.voi.windowCenter, enabledElement.viewport.voi.windowWidth);
        
        // set Slope Intercept (vec2)
        var siLocation = gl.getUniformLocation(program, "u_slopeIntercept");
        gl.uniform2f(siLocation, image.slope, image.intercept);
        
        // Create a buffer for the position of the rectangle corners.
        var posbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        setRectangle(gl, 0, 0, width, height);

        // Render to the canvas
        render(gl, texture, program);

        // ----- Testing purposes only -----
        function step(timestamp) {
            ii += 10;
            var t0 = performance.now();
            gl.uniform2f(wlLocation, -ii%1000-50, ii%1000+50 );
            render(gl, texture, program);
            var t1 = performance.now();
            console.log("Call render " + (t1 - t0) + " milliseconds.");
            window.requestAnimationFrame(step);
        }
        // window.requestAnimationFrame(step);
        // ----- Testing purposes only -----

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
