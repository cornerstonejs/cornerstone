(function (cornerstone) {

    "use strict";

    function getShader(image) {
        var datatype = image.datatype;
        datatype = datatype || "int16";
        // We need a mechanism for
        // choosing the shader based on the image datatype
        console.log("Datatype: " + datatype);
        if (cornerstone.shaders.hasOwnProperty(datatype)) {
            return cornerstone.shaders[datatype];
        }
        var shader = cornerstone.shaders.rgb;
        return shader;
    }

    cornerstone.rendering.getShader = getShader;

}(cornerstone));