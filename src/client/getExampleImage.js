var cornerstone = (function (cs, csc) {

    if(cs === undefined) {
        cs = {};
    }

    /*csc.readPixelData('../pixels108.raw', function(data) {
     var ab = cs.image108;
     var ab = new Uint16Array(data);
     var index = 0;
     for(var rows=0; rows < 256; rows++) {
     for(var columns=0; columns< 256; columns++) {
     image108.storedPixelData[index] = ab[index++];
     }
     }
     updateImage(enabledElements[0].element);
     });

     csc.readPixelData('../pixels109.raw', function(data) {
     var ab = new Uint16Array(data);
     var index = 0;
     for(var rows=0; rows < 256; rows++) {
     for(var columns=0; columns< 256; columns++) {
     image109.storedPixelData[index] = ab[index++];
     }
     }
     updateImage(enabledElements[0].element);
     });
     */

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        var index = 0;
        for (var i=0, strLen=str.length; i<strLen; i+=2) {
            var lower = str.charCodeAt(i);
            var upper = str.charCodeAt(i+1);
            bufView[index] = lower + (upper >>8);
            index++;
        }
        return bufView;
    }



    function updatePixels(image, base64PixelData)
    {
        var pixelDataAsString = window.atob(base64PixelData);
        var pixelData = str2ab(pixelDataAsString);

        var index = 0;
        for(rows=0; rows < 256; rows++) {
            for(columns=0; columns< 256; columns++) {
                image.storedPixelData[index] = pixelData[index++];
            }
        }
    };

    function getExampleImage(imageId) {
        var image = csc.image();
        if(imageId == '1.3.12.2.1107.5.2.32.35020.2011062208172724415309288')
        {
            updatePixels(image, cs.image108Base64);
        }
        else if(imageId = '1.3.12.2.1107.5.2.32.35020.2011062208172724415309289')
        {
            updatePixels(image, cs.image109Base64);
        }
        return image;
    }

    cs.getExampleImage = getExampleImage;


    return cs;
}(cornerstone, cornerstoneCore));