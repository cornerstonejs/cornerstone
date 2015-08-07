/*

use trianglestrip
prevent regenerate textures
prevent reinit rendering context
prevent reinit shaderprograms
prevent regenerate buffers
correct gl.viewport

 */
(function (cornerstone) {

    "use strict";

    var renderCanvas = document.createElement('canvas');
    var renderCanvasContext;
    var renderCanvasData;
    var gl;
    var programs;
    var shader;
    var texCoordBuffer, positionBuffer;

    function initShaders() {

        for (var id in cornerstone.shaders) {

            var shader = cornerstone.shaders[ id ];
            shader.program = cornerstone.rendering.initShaders(gl, shader.frag, shader.vert);

        }
    }

    function initRenderer() {
        
        if ( initWebGL( renderCanvas ) ) {
            
            //initializeWebGLContext();
            initBuffers();
            initShaders();
            console.log("WEBGL Renderer initialized!", gl);
        }
    }

    function updateRectangle(gl, x, y, width, height) {
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

    function initWebGL(canvas) {
        gl = null;
        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            var options = {
                preserveDrawingBuffer: true, // preserve buffer so we can copy to display canvas element
                failIfMajorPerformanceCaveat: true
            };
            gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
        } catch(error) {
            throw "Error creating WebGL context";
        }

        // If we don't have a GL context, give up now
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
            gl = null;
        }
        return gl;
    }

    function getImageDataType(image) {
        
        return image.color ? "rgb" : image.datatype || "int16";

    }

    function getShader(image) {

        var datatype = getImageDataType(image);
        // We need a mechanism for
        // choosing the shader based on the image datatype
        console.log("Datatype: " + datatype);
        if (cornerstone.shaders.hasOwnProperty(datatype)) {
            return cornerstone.shaders[ datatype ];
        }

        var shader = cornerstone.shaders.rgb;
        return shader;
    }

    function enableImageTexture( image ) {
        
        //@todo cache?
        if ( !image.texture ) {
            image.texture = generateTexture( image );
            console.log("Generating texture");
        }
        gl.bindTexture(gl.TEXTURE_2D, image.texture);

    }

    function generateTexture( image ) {
        
        // Get the texture format for this datatype
        //!!!! fixme
        
        var TEXTURE_FORMAT = {
            "rgb": gl.RGB,
            "uint8": gl.LUMINANCE,
            "int8": gl.LUMINANCE,
            "uint16": gl.LUMINANCE_ALPHA,
            "int16": gl.LUMINANCE_ALPHA
        }

        var imageDataType = getImageDataType(image);
        var format = TEXTURE_FORMAT[imageDataType];

        console.log(">>>>>>>>>>>>", imageDataType, format);

        // GL texture configuration
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var imageData = cornerstone.shaders[imageDataType].storedPixelDataToImageData(image, image.width, image.height); // shader. ???

        gl.texImage2D(gl.TEXTURE_2D, 0, format, image.width, image.height, 0, format, gl.UNSIGNED_BYTE, imageData);

        return texture;

    }

    function initBuffers() {

        // provide texture coordinates for the rectangle.
        texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
    }

    function render(enabledElement) {

        if (!enabledElement) {
            throw "drawImage: enabledElement parameter must not be undefined";
        }

        var image = enabledElement.image;
        if (!image) {
            throw "drawImage: image must be loaded before it can be drawn";
        }

        updateElement(enabledElement);

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

        // Set the current shader
        shader = getShader(image);
        console.log(shader);
        program = shader.program;


        var width = image.width;
        var height = image.height;

        // GL texture configuration
        enableImageTexture(image);

        var viewport = enabledElement.viewport;

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        var positionLocation = gl.getAttribLocation(program, "a_position");
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        updateRectangle(gl, 0, 0, width, height);
        
        // Set the resolution
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
        gl.clearColor(0.5, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Use program
        //gl.useProgram(shaderProgram);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Save the canvas context state and apply the viewport properties
        cornerstone.setToPixelCoordinateSystem(enabledElement, context);

        // Copy pixels from the offscreen canvas to the onscreen canvas
        context.drawImage(renderCanvas, 0,0, image.width, image.height, 0, 0, image.width, image.height);
/*
        // Save lastRendered information
        lastRenderedImageId = image.imageId;
        lastRenderedViewport.windowCenter = enabledElement.viewport.voi.windowCenter;
        lastRenderedViewport.windowWidth = enabledElement.viewport.voi.windowWidth;
        lastRenderedViewport.invert = enabledElement.viewport.invert;
        lastRenderedViewport.rotation = enabledElement.viewport.rotation;
        lastRenderedViewport.hflip = enabledElement.viewport.hflip;
        lastRenderedViewport.vflip = enabledElement.viewport.vflip;
*/

    }


    function updateElement(enabledElement) {
        
        var image = enabledElement.image;

        // Resize the canvas
        renderCanvas.width = image.width;
        renderCanvas.height = image.height;
        
        if (gl)
            gl.viewport( 0,0 , image.width, image.height );        

        // Get A WebGL context
        // We already got it defined! gl = cornerstone.rendering.initWebGL(renderCanvas);
        
    }

    cornerstone.rendering.webGLRenderer = {
        render: render,
        initRenderer:initRenderer
    };

    //initRenderer();
/*
    // Module exports
    cornerstone.rendering.grayscaleImageWebGL = renderColorImageWebGL;
    cornerstone.renderColorImageWebGL = renderColorImageWebGL;
*/
}(cornerstone));

