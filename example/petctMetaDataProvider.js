(function (cornerstone) {

    "use strict";

    function metaDataProvider(type, imageId)
    {
        if(type === 'imagePlane') {

            if (imageId === 'ct://1') {
                return {
                    frameOfReferenceUID: "1.3.6.1.4.1.5962.99.1.2237260787.1662717184.1234892907507.1411.0",
                    rows: 512,
                    columns: 512,
                    rowCosines: {
                        x: 1,
                        y: 0,
                        z: 0
                    },
                    columnCosines: {
                        x: 0,
                        y: 1,
                        z: 0
                    },
                    imagePositionPatient: {
                        x: -250,
                        y: -250,
                        z: -399.100006
                    },
                    rowPixelSpacing: 0.976562,
                    columnPixelSpacing: 0.976562
                };
            }

            if (imageId === 'pet://1') {
                return {
                    frameOfReferenceUID: "1.3.6.1.4.1.5962.99.1.2237260787.1662717184.1234892907507.1411.0",
                    rows: 128,
                    columns: 128,
                    rowCosines: {
                        x: 1,
                        y: 0,
                        z: 0
                    },
                    columnCosines: {
                        x: 0,
                        y: 1,
                        z: 0
                    },
                    imagePositionPatient: {
                        x: -297.65625,
                        y: -297.65625,
                        z: -399.12002563476
                    },
                    rowPixelSpacing: 4.6875,
                    columnPixelSpacing: 4.6875
                };
            }
        }

        return undefined;
    }

    cornerstone.metaData.addProvider(metaDataProvider);

}(cornerstone));