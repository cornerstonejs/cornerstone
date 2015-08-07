/*

use trianglestrip
prevent regenerate textures
prevent reinit rendering context
prevent reinit shaderprograms
prevent regenerate buffers
correct gl.viewport
order vert, frag
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

            console.log("WEBGL: Loading shader",id);
            var shader = cornerstone.shaders[ id ];
            shader.attributes = {};
            shader.uniforms = {};

            shader.program = cornerstone.rendering.createProgramFromString(gl, shader.vert, shader.frag);

            shader.attributes.texCoordLocation = gl.getAttribLocation(shader.program, "a_texCoord");
            gl.enableVertexAttribArray(shader.attributes.texCoordLocation);
        
            shader.attributes.positionLocation = gl.getAttribLocation(shader.program, "a_position");
            gl.enableVertexAttribArray(shader.attributes.positionLocation);
        
            shader.uniforms.resolutionLocation = gl.getUniformLocation(shader.program, "u_resolution");

        }  
    }

    function initRenderer() {
        
        if ( initWebGL( renderCanvas ) ) {
            
            initBuffers();
            initShaders();
            console.log("WEBGL Renderer initialized!", gl);
        }
    }

    function updateRectangle(gl, width, height) {

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            width, height, 
            0, height,
            width, 0,
            0, 0]), gl.STATIC_DRAW);
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

    function getShaderProgram(image) {

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
        
        var TEXTURE_FORMAT = {
            "rgb": gl.RGB,
            "uint8": gl.LUMINANCE,
            "int8": gl.LUMINANCE,
            "uint16": gl.LUMINANCE_ALPHA,
            "int16": gl.LUMINANCE_ALPHA
        }

        var imageDataType = getImageDataType(image);
        var format = TEXTURE_FORMAT[imageDataType];

        // GL texture configuration
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        var imageData = cornerstone.shaders[imageDataType].storedPixelDataToImageData(image, image.width, image.height);

        gl.texImage2D(gl.TEXTURE_2D, 0, format, image.width, image.height, 0, format, gl.UNSIGNED_BYTE, imageData);

        return texture;

    }

    function initBuffers() {
 
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            1, 1, 
            0, 1, 
            1, 0, 
            0, 0
        ]), gl.STATIC_DRAW);
 
 
        texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([         
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
        ]), gl.STATIC_DRAW);
    }

    function renderQuad(shader, parameters, texture, canvasView )
    {
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shader.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        var positionLocation = gl.getAttribLocation(program, "a_position");
        //positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);


        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(shader.program.vertexPositionAttribute, dynamicSquareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shader.program.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        for (var key in parameters)
        {
            var uniformLocation = gl.getUniformLocation(shader.program, key);
            if ( !uniformLocation ) continue;

            var uniform = parameters[key];

            var type = uniform.type;
            var value = uniform.value;

            if( type == "i" )
            {
                gl.uniform1i( uniformLocation, value );
            }
            else if( type == "f" )
            {
                gl.uniform1f( uniformLocation, value );
            }
        }

        //gl.uniform1i(shader.program.samplerUniform, 0);
        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, texture);

        //gl.drawArrays(gl.TRIANGLE_STRIP, 0, dynamicSquareVertexPositionBuffer.numItems);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
        var shader = getShaderProgram(image);

        gl.useProgram(shader.program);

        var viewport = enabledElement.viewport;

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        var texCoordLocation = gl.getAttribLocation(shader.program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        var positionLocation = gl.getAttribLocation(shader.program, "a_position");
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        updateRectangle(gl, image.width, image.height);
        
        console.log(enabledElement.viewport.voi.windowCenter);

        var parameters = {
            "u_resolution": { type: "2f", value: [image.width, image.height] },
            "wc": { type: "f", value: enabledElement.viewport.voi.windowCenter },
            "ww": { type: "f", value: enabledElement.viewport.voi.windowWidth },
            "slope": { type: "f", value: image.slope },
            "intercept": { type: "f", value: image.intercept },
            "minPixelValue": { type: "f", value: image.minPixelValue },
            "invert": { type: "i", value: enabledElement.viewport.invert ? 1 : 0 },

        }

        for (var key in parameters)
        {
            var uniformLocation = gl.getUniformLocation(shader.program, key);
            if ( !uniformLocation ) throw "Could not access location for uniform: " + key;

            var uniform = parameters[key];

            var type = uniform.type;
            var value = uniform.value;

            if( type == "i" )
            {
                gl.uniform1i( uniformLocation, value );
            }
            else if( type == "f" )
            {
                gl.uniform1f( uniformLocation, value );
            }
            else if( type == "2f" )
            {
                gl.uniform2f( uniformLocation, value[0], value[1] );
            }
        }

        // Do the actual rendering
        gl.clearColor(0.5, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.activeTexture(gl.TEXTURE0);
        enableImageTexture(image);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

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

    initRenderer();
/*
    // Module exports
    cornerstone.rendering.grayscaleImageWebGL = renderColorImageWebGL;
    cornerstone.renderColorImageWebGL = renderColorImageWebGL;
*/
}(cornerstone));

