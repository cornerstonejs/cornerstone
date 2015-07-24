(function (cornerstone) {

    "use strict";

    if (!cornerstone.webGL) {
        cornerstone.webGL = {};
    }

    /**
     * Creates and compiles a shader.
     *
     * @param {!WebGLRenderingContext} gl The WebGL Context.
     * @param {string} shaderSource The GLSL source code for the shader.
     * @param {number} shaderType The type of shader, VERTEX_SHADER or FRAGMENT_SHADER.
     *     
     * @return {!WebGLShader} The shader.
     */
    function compileShader(gl, shaderSource, shaderType) {
        
        // Create the shader object
        var shader = gl.createShader(shaderType);

        // Set the shader source code.
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check if it compiled
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success && !gl.isContextLost()) {
            // Something went wrong during compilation; get the error
            var infoLog = gl.getShaderInfoLog(shader);
            console.error("Could not compile shader:\n" + infoLog);
        }

        return shader;
    }

    /**
     * Creates a program from 2 shaders.
     *
     * @param {!WebGLRenderingContext) gl The WebGL context.
     * @param {!WebGLShader} vertexShader A vertex shader.
     * @param {!WebGLShader} fragmentShader A fragment shader.
     * @return {!WebGLProgram} A program.
     */
    function createProgram(gl, vertexShader, fragmentShader) {
        
        // create a program.
        var program = gl.createProgram();

        // attach the shaders.
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // link the program.
        gl.linkProgram(program);

        // Check if it linked.
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success && !gl.isContextLost()) {
            // something went wrong with the link
            var infoLog = gl.getProgramInfoLog(program);
            console.error("WebGL program filed to link:\n" + infoLog);
        }

        return program;
    }

    /**
     * Creates a program from 2 shaders source (Strings)
     * @param  {!WebGLRenderingContext} gl              The WebGL context.
     * @param  {!WebGLShader} vertexShaderSrc   Vertex shader string
     * @param  {!WebGLShader} fragShaderSrc Fragment shader string
     * @return {!WebGLProgram}                 A program
     */
    function createProgramFromString(gl, vertexShaderSrc, fragShaderSrc) {
        var vertexShader = compileShader(gl, vertexShaderSrc, gl.VERTEX_SHADER);
        var fragShader = compileShader(gl, fragShaderSrc, gl.FRAGMENT_SHADER);
        return createProgram(gl, vertexShader, fragShader);
    }

    cornerstone.webGL.createProgramFromString = createProgramFromString;

}(cornerstone));
