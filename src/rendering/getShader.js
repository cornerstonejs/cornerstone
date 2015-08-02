(function (cornerstone) {

    "use strict";

    function getShader(image) {
        var datatype = image.datatype;
        datatype = "int16";
        //datatype = "uint8";
        if (cornerstone.shaders.hasOwnProperty(datatype)) {
            return cornerstone.shaders[datatype];
        }
        var shader = cornerstone.shaders.rgb;
        return shader;
    }

    cornerstone.rendering.getShader = getShader;

}(cornerstone));
