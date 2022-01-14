(function (cs) {


  function getExampleImage (imageId) {
    const testCase = imageId.split('//')[1];

    return {
      promise: new Promise((resolve) => {
        getImageData(testCase).then((imageData) => {
          getImagePixel(testCase, imageData).then((imagePixel) => {
            imageData.getPixelData = () => imagePixel;

            resolve(imageData);
          });
        });
      }),
      cancelFn: undefined
    };

    function getImagePixel (imageId, imageData) {
      const promise = new Promise((resolve) => {
        const req = new XMLHttpRequest();

        req.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            const imageRaw = req.responseText;
            const bpp = imageData.sizeInBytes / (imageData.width * imageData.height);

            if (bpp === 1) {
              const pixelData = Uint8Array.from(atob(imageRaw), (c) => c.charCodeAt(0));

              resolve(pixelData);
            } else if (bpp === 2) {
              const decodedData = atob(imageRaw);
              const pixelData = new Uint16Array(decodedData.length / 2);
              let count = 0;

              for (let i = 0; i < pixelData.length; i++) {
                pixelData[i] = decodedData.charCodeAt(count++) + (decodedData.charCodeAt(count++) << 8);

              }

              resolve(pixelData);
            }
          }
        };
        req.open('GET', `${baseUrl + imageId}.txt`, true);
        req.send();
      });

      return promise;
    }

    function getImageData (imageId) {
      const promise = new Promise((resolve) => {
        const req = new XMLHttpRequest();

        req.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            const imageData = req.responseText;

            try {
              const image = JSON.parse(imageData);

              resolve(image);
            } catch (err) {
              console.error(err);
            }
          }
        };
        req.open('GET', `${baseUrl + imageId}.json`, true);
        req.send();
      });

      return promise;
    }
  }


  var baseUrl = `${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}/test-cases/`;

  // register our imageLoader plugin with cornerstone
  cs.registerImageLoader('example', getExampleImage);

})(cornerstone);
