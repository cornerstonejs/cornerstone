(function (cornerstone) {

    "use strict";

    function initShaders(gl, fragShaderSrc, vertexShaderSrc) {
        // Create shader program
        var shaderProgram = gl.createProgram();

        // Create and attach the fragment Shader
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragShaderSrc);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw "An error occurred compiling the fragment shader";
        }
        gl.attachShader(shaderProgram, fragmentShader);

        // Create and attach the vertex shader
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

    cornerstone.rendering.initShaders = initShaders;

}(cornerstone));
