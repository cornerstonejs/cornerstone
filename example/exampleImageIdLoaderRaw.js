(function (cs) {

    "use strict";

    function getExampleImage(imageId) {
      let testCase = imageId.split('//')[1];

        return {
          promise: new Promise((resolve) => {
            getImagePixel(testCase).then((imagePixel) => {
              getImageData(testCase).then((imageData) => {
                imageData.getPixelData = () => { return imagePixel; };

                resolve(imageData);
              });
            });

            }),
            cancelFn: undefined
        };

        function getImagePixel(imageId) {
          let promise = new Promise((resolve) => {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
              if (this.readyState == 4 && this.status === 200 ) {
                let imageRaw = req.responseText;
                let pixelData = Uint8Array.from(atob(imageRaw), c => c.charCodeAt(0));

                resolve(pixelData);
              }
            }
            req.open('GET', baseUrl + imageId + '.txt', true);
            req.send();
          });

          return promise;
        }

        function getImageData(imageId) {
          let promise = new Promise((resolve) => {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
              if (this.readyState === 4 && this.status === 200) {
                let imageData = req.responseText;

                try {
                  let image = JSON.parse(imageData);

                  resolve(image);
                }
                catch (err) {
                  console.error(err);
                }
              }
            }
            req.open('GET', baseUrl + imageId + '.json', true);
            req.send();
          });

          return promise;
        }
    }

    var baseUrl = '/example/displayedArea/test-cases/';

    // register our imageLoader plugin with cornerstone
    cs.registerImageLoader('example', getExampleImage);

}(cornerstone));