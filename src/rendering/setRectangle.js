(function (cornerstone) {

    "use strict";

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

    cornerstone.rendering.setRectangle = setRectangle;

}(cornerstone));
