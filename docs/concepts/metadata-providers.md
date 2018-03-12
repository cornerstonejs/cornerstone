---
description: A Metadata Provider is a JavaScript function that acts as an interface for accessing metadata related to Images in Cornerstone.
---

# Metadata Providers

> A **Metadata Provider** is a JavaScript function that acts as an interface for accessing metadata related to Images in Cornerstone. Users can define their own provider functions in order to return any metadata they wish for each specific image.

Medical images typically come with lots of non-pixel-wise metadata such as for example, the pixel spacing of the image, the patient ID, or the scan acquisition date. With some file types (e.g. DICOM), this information is stored within the file header and can be read and parsed and passed around your application. With others (e.g. JPEG, PNG), this information needs to be provided independently from the actual pixel data. Even for DICOM images, however, it is common for application developers to provide metadata independently from the transmission of pixel data from the server to the client since this can considerably improve performance.

To handle these scenarios, Cornerstone provides infrastructure for the definition and usage of *Metadata Providers*. Metadata Providers are simply functions which take in an [Image Id](image-ids.md) and specified metadata type, and return the metadata itself.

Here is a simple example of a Metadata Provider which returns an Object containing Image Plane metadata for a single specific image (Image Id: 'ct://1'):

````javascript
function metaDataProvider(type, imageId)
  if (type === 'imagePlaneModule') {
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
  }
}

// Register this provider with CornerstoneJS
cornerstone.metaData.addProvider(metaDataProvider);

// Retrieve this metaData
var imagePlaneModule = cornerstone.metaData.get('imagePlaneModule', 'ct://1');
````

## Basics
  * Cornerstone allows for the registration of multiple Metadata Providers.
  * Each provider can provide whichever information the developer desires.
  * When a request is made for metadata for an image, Cornerstone will iterate through the known providers until it retrieves a defined set of metadata for the specified metadata type.
  * Providers can be added to Cornerstone with an optional priority value in order to influence the order in which they are called.
  * When DICOM images are loaded by [Cornerstone WADO Image Loader](https://github.com/cornerstonejs/cornerstoneWADOImageLoader), their metadata will be parsed and added to a metadata provider automatically.
  * Within [Cornerstone Tools](https://github.com/cornerstonejs/cornerstoneTools), specific metadata types are used to provide metadata for tools.
