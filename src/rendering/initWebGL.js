(function (cornerstone) {

    "use strict";

    function initWebGL(canvas) {
        var gl = null;
        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            var options = {
                preserveDrawingBuffer: true, // preserve buffer so we can copy to display canvas element
                failIfMajorPerformanceCaveat: true
            };
            gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
        }
        catch(error) {
            throw "Error creating WebGL context";
        }

        // If we don't have a GL context, give up now
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser may not support it.");
            gl = null;
        }
        return gl;
    }

    cornerstone.rendering.initWebGL = initWebGL;

}(cornerstone));
