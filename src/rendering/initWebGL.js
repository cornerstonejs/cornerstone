(function (cornerstone) {

    "use strict";

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

    cornerstone.rendering.initWebGL = initWebGL;

}(cornerstone));
