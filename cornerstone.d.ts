declare module 'cornerstone-core' {
  type Matrix = [number, number, number, number, number, number];
  
  interface LayerOptions {
    viewport: Viewport;
    visible: boolean;
    opacity: number;
  }
  
  /**
   * A two-dimensional vector
   */
  interface Vec2 {
    x: number;
    y: number;
  }
  
  interface CornerstoneEventData {
    canvasContext?: CanvasRenderingContext2D;
    element?: HTMLElement;
    enabledElement?: EnabledElement;
    image?: Image;
    renderTimeInMs?: number;
    viewport?: Viewport;
    
    oldImage?: Image;
    frameRate?: number;
  }
  
  interface CornerstoneEvent extends Event {
    detail?: CornerstoneEventData;
  }
  
  /**
   * Lookup Table Array
   *
   * @link https://docs.cornerstonejs.org/api.html#lut
   */
  interface LUT {
    id: string;
    firstValueMapped: number;
    numBitsPerEntry: number;
    lut: number[];
  }
  
  /**
   * VOI
   *
   * @link https://docs.cornerstonejs.org/api.html#voi
   */
  interface VOI {
    windowWidth: number;
    windowCenter: number;
  }
  
  /**
   * Volume of Interest Lookup Table Function
   */
  type VOILUTFunction = (modalityLutValue: number) => number;
  
  /**
   * A Viewport Settings Object Cornerstone
   *
   * @link https://docs.cornerstonejs.org/api.html#viewport
   */
  interface Viewport {
    /** The scale applied to the image. A scale of 1.0 will display no zoom (one image pixel takes up one screen pixel). A scale of 2.0 will be double zoom and a scale of .5 will be zoomed out by 2x */
    scale: number;
    
    /** an object with properties x and y which describe the translation to apply in the pixel coordinate system. Note that the image is initially displayed centered in the enabled element with a x and y translation of 0 and 0 respectively. */
    translation: Vec2;
    
    /** an object with properties windowWidth and windowCenter. */
    voi: VOI;
    
    /** Whether or not the image is inverted. */
    invert: boolean;
    
    /** true if the image smooth / interpolation should be used when zoomed in on the image or false if pixel replication should be used. */
    pixelReplication: boolean;
    
    /** the rotation of the image (90 degree increments). Default is 0 */
    rotation: number;
    
    /** true if the image is flipped horizontally. Default is false */
    hflip: boolean;
    
    /** true if the image is flipped vertically. Default is false */
    vfilip: boolean;
    
    /** the modality LUT to apply or undefined if none */
    modalityLUT: LUT | undefined;
    
    /** the VOI LUT to apply or undefined if none */
    voiLUT: LUT | undefined;
    
    /** an optional colormap ID or colormap object (from colors/colormap.js). This will be applied during rendering to convert the image to pseudocolor */
    colormap: string | object | undefined;
    
    /** whether or not to render this image as a label map (i.e. skip modality and VOI LUT pipelines and use only a color lookup table) */
    labelmap: boolean | undefined;
    
    /** ? */
    displayedArea: {
      // Displayed Area is 1-based
      tlhc: {
        x: number;
        y: number;
      };
      
      // Bottom Right Hand Corner
      brhc: {
        x: number;
        y: number;
      };
      
      rowPixelSpacing: number;
      
      columnPixelSpacing: number;
      
      presentationSizeMode: string;
    };
  }
  
  /**
   * An Image Load Object
   *
   * @link https://docs.cornerstonejs.org/api.html#imageloadobject
   */
  interface ImageLoadObject {
    /** The Promise tracking the loading of this image */
    promise: Promise<Image>;
    
    /** A function to cancel the image load request */
    cancelFn: () => void | undefined;
  }
  
  /**
   * Image Statistics Object
   *
   * https://docs.cornerstonejs.org/api.html#imagestats
   */
  interface ImageStats {
    /** The time in ms taken to retrieve stored pixels required to draw the image */
    lastGetPixelDataTime?: number;
    
    /** The time in ms taken to map from stored pixel array to canvas pixel array */
    lastStoredPixelDataToCanvasImageDataTime?: number;
    
    /** The time in ms taken for putImageData to put the canvas pixel data into the canvas context */
    lastPutImageDataTime?: number;
    
    /** The total time in ms taken for the entire rendering function to run */
    lastRenderTime?: number;
    
    /** The time in ms taken to generate the lookup table for the image */
    lastLutGenerateTime?: number;
  }
  
  /**
   * An Image Object in Cornerstone
   *
   * @link https://docs.cornerstonejs.org/api.html#image
   */
  interface Image {
    /** The imageId associated with this image object */
    imageId: string;
    
    /** the minimum stored pixel value in the image */
    minPixelValue: number;
    
    /** the maximum stored pixel value in the image */
    maxPixelValue: number;
    
    /** the rescale slope to convert stored pixel values to modality pixel values or 1 if not specified */
    slope: number;
    
    /** the rescale intercept used to convert stored pixel values to modality values or 0 if not specified */
    intercept: number;
    
    /** the default windowCenter to apply to the image */
    windowCenter: number;
    
    /** the default windowWidth to apply to the image */
    windowWidth: number;
    
    /** a function that returns the underlying pixel data. An array of integers for grayscale and an array of RGBA for color */
    getPixelData: () => Uint8Array;
    
    /** a function that returns a canvas imageData object for the image. This is only needed for color images */
    getImageData: () => ImageData;
    
    /** a function that returns a canvas element with the image loaded into it. This is only needed for color images. */
    getCanvas: () => HTMLCanvasElement;
    
    /** a function that returns a JavaScript Image object with the image data. This is optional and typically used for images encoded in standard web JPEG and PNG formats */
    getImage: () => HTMLImageElement;
    
    /** number of rows in the image. This is the same as height but duplicated for convenience */
    rows: number;
    
    /** number of columns in the image. This is the same as width but duplicated for convenience */
    columns: number;
    
    /** The Lookup Table */
    lut: LUT;
    
    /** Is the color pixel data stored in RGBA? */
    rgba: boolean;
    
    /** horizontal distance between the middle of each pixel (or width of each pixel) in mm or undefined if not known */
    columnPixelSpacing: number;
    
    /** vertical distance between the middle of each pixel (or height of each pixel) in mm or undefined if not known */
    rowPixelSpacing: number;
    
    /** true if the the image should initially be displayed be inverted, false if not. This is here mainly to support DICOM images with a photometric interpretation of MONOCHROME1 */
    invert: boolean;
    
    /** the number of bytes used to store the pixels for this image. */
    sizeInBytes: number;
    
    /** Whether or not the image has undergone false color mapping */
    falseColor?: boolean;
    
    /** Original pixel data for an image after it has undergone false color mapping */
    origPixelData?: number[];
    
    /** Statistics for the last redraw of the image */
    stats?: ImageStats;
    
    /** Cached Lookup Table for this image. */
    cachedLut: LUT;
    
    /** true if pixel data is RGB, false if grayscale */
    color: boolean;
    
    /** @deprecated Use viewport.colormap instead. an optional colormap ID or colormap object (from colors/colormap.js). This will be applied during rendering to convert the image to pseudocolor */
    colormap?: string | object;
    
    /** whether or not to render this image as a label map (i.e. skip modality and VOI LUT pipelines and use only a color lookup table) */
    labelmap?: boolean;
    
    /** ? */
    voiLUT?: LUT;
    
    /** the width of the image. This is the same as columns but duplicated for convenience */
    width: number;
    
    /** the height of the image. This is the same as rows but duplicated for convenience */
    height: number;
  }
  
  /**
   * An Enabled Element Layer in Cornerstone
   *
   * @link https://docs.cornerstonejs.org/api.html#enabledelementlayer
   */
  interface EnabledElementLayer {
    /** The DOM element which has been enabled for use by Cornerstone */
    element: HTMLElement;
    
    /** The image currently displayed in the enabledElement */
    image?: Image;
    
    /** The current viewport settings of the enabledElement */
    viewport?: Viewport;
    
    /** The current canvas for this enabledElement */
    canvas?: HTMLCanvasElement;
    
    /** Whether or not the image pixel data underlying the enabledElement has been changed, necessitating a redraw */
    invalid: boolean;
    
    /** A flag for triggering a redraw of the canvas without re-retrieving the pixel data, since it remains valid */
    needsRedraw: boolean;
    
    /** Layer drawing options */
    options?: {renderer?: 'webgl'};
  }
  
  /**
   * An Enabled Element in Cornerstone
   *
   * @link https://docs.cornerstonejs.org/api.html#enabledelement
   */
  interface EnabledElement {
    /** The DOM element which has been enabled for use by Cornerstone */
    element: HTMLElement;
    
    /** The image currently displayed in the enabledElement */
    image?: Image;
    
    /** The current viewport settings of the enabledElement */
    viewport?: Viewport;
    
    /** The current canvas for this enabledElement */
    canvas?: HTMLCanvasElement;
    
    /** Whether or not the image pixel data underlying the enabledElement has been changed, necessitating a redraw */
    invalid: boolean;
    
    /** A flag for triggering a redraw of the canvas without re-retrieving the pixel data, since it remains valid */
    needsRedraw: boolean;
    
    /** The layers that have been added to the enabledElement */
    layers?: EnabledElementLayer[];
    
    /** Whether or not to synchronize the viewport parameters */
    syncViewports?: boolean;
    
    // for each of the enabled element's layers
    
    /** The previous state for the sync viewport boolean */
    lastSyncViewportsState?: boolean;
  }
  
  namespace colors {
    /**
     * Return a colorMap object with the provided id and colormapData if the Id matches existent colorMap objects (check colormapsData) the colormapData is ignored. if the colormapData is not empty, the colorMap will be added to the colormapsData list. Otherwise, an empty colorMap object is returned.
     *
     * @param id The ID of the colormap
     * @param colormapData An object that can contain a name, numColors, gama, segmentedData and/or colors
     * @returns The Colormap Object
     */
    function getColormap(id: string, colormapData: unknown): Colormap;
    
    /**
     * Return all available colormaps (id and name)
     *
     * @returns Array<{id, key}> An array of colormaps with an object containing the "id" and display "name"
     */
    function getColormapsList(): {id: string, key: string}[];
    
    /**
     * Maps scalar values into colors via a lookup table
     * LookupTable is an object that is used by mapper objects to map scalar values
     * into rgba (red-green-blue-alpha transparency) color specification, or rgba into scalar values.
     * The color table can be created by direct insertion of color values,
     * or by specifying hue, saturation, value, and alpha range and generating a table
     */
    export class LookupTable {
      /**
       * Specify the number of values (i.e., colors) in the lookup table.
       *
       * @param numColors The number of colors in he LookupTable
       */
      setNumberOfTableValues: (numColors: number) => void;
      
      /**
       * Set the shape of the table ramp to either 'linear', 'scurve' or 'sqrt'
       *
       * @param ramp A string value representing the shape of the table. Allowed values are 'linear', 'scurve' or 'sqrt'
       */
      setRamp: (ramp: 'linear' | 'scurve' | 'sqrt') => void;
      
      /**
       * Sets the minimum/maximum scalar values for scalar mapping.
       * Scalar values less than minimum range value are clamped to minimum range value.
       * Scalar values greater than maximum range value are clamped to maximum range value.
       *
       * @param start A double representing the minimum scaler value of the LookupTable
       * @param end A double representing the maximum scaler value of the LookupTable
       */
      setTableRange: (start: number, end: number) => void;
      
      /**
       * Set the range in hue (using automatic generation). Hue ranges between [0,1].
       * @param start A double representing the minimum hue value in a range. Min. is 0
       * @param end A double representing the maximum hue value in a range. Max. is 1
       */
      setHueRange: (start: number, end: number) => void;
      
      /**
       * Set the range in saturation (using automatic generation). Saturation ranges between [0,1].
       *
       * @param start A double representing the minimum Saturation value in a range. Min. is 0
       * @param end A double representing the maximum Saturation value in a range. Max. is 1
       */
      setSaturationRange: (start: number, end: number) => void;
      
      /**
       * Set the range in value (using automatic generation). Value ranges between [0,1].
       *
       * @param start A double representing the minimum value in a range. Min. is 0
       * @param end A double representing the maximum value in a range. Max. is 1
       */
      setValueRange: (start: number, end: number) => void;
      
      /**
       * Set the range in alpha (using automatic generation). Alpha ranges from [0,1].
       *
       * @param start A double representing the minimum alpha value
       * @param end A double representing the maximum alpha value
       */
      setAlphaRange: (start: number, end: number) => void;
      
      /**
       * Map one value through the lookup table and return the color as an
       * RGBA array of doubles between 0 and 1.
       *
       * @param scalar A double scalar value which will be mapped to a color in the LookupTable
       * @returns An RGBA array of doubles between 0 and 1
       */
      getColor: (scalar: number) => [number, number, number, number];
      
      /**
       * Generate lookup table from hue, saturation, value, alpha min/max values. Table is built from linear ramp of each value.
       *
       * @param force true to force the build of the LookupTable. Otherwie, false. This is useful if a lookup table has been defined manually
       * (using SetTableValue) and then an application decides to rebuild the lookup table using the implicit process.
       */
      build: (force: boolean) => void;
      
      /**
       * Ensures the out-of-range colors (Below range and Above range) are set correctly.
       */
      buildSpecialColors: () => void;
      
      /**
       * Similar to GetColor - Map one value through the lookup table and return the color as an
       * RGBA array of doubles between 0 and 1.
       *
       * @param v A double scalar value which will be mapped to a color in the LookupTable
       * @returns An RGBA array of doubles between 0 and 1
       */
      mapValue: (v: number) => [number, number, number, number];
      
      /**
       * Return the table index associated with a particular value.
       *
       * @param v A double value which table index will be returned.
       * @returns The index in the LookupTable
       */
      getIndex: (v: number) => number;
      
      /**
       * Directly load color into lookup table. Use [0,1] double values for color component specification.
       * Make sure that you've either used the Build() method or used SetNumberOfTableValues() prior to using this method.
       *
       * @param index The index in the LookupTable of where to insert the color value
       * @param rgba An array of [0,1] double values for an RGBA color component
       */
      setTableValue: (index: number, rgba: [number, number, number, number]) => void;
    }
  }
  
  namespace internal {
    /**
     * Internal API function to draw an image to a given enabled element
     *
     * @param enabledElement The Cornerstone Enabled Element to redraw
     * @param invalidated true if pixel data has been invalidated and cached rendering should not be used (optional, default false)
     */
    function drawImage(enabledElement: EnabledElement, invalidated?: boolean);
    
    /**
     * Creates a LUT used while rendering to convert stored pixel values to display pixels
     *
     * @param image A Cornerstone Image Object
     * @param windowWidth The Window Width
     * @param windowCenter The Window Center
     * @param invert A boolean describing whether or not the image has been inverted
     * @param modalityLUT A modality Lookup Table
     * @param voiLUT A Volume of Interest Lookup Table
     * @returns A lookup table to apply to the image
     */
    function generateLut(image: Image, windowWidth: number, windowCenter: number, invert: boolean, modalityLUT?: number[], voiLUT?: number[]): Uint8ClampedArray;
    
    // https://github.com/cornerstonejs/cornerstone/blob/12da9ed267499345ef192d9e5f214cc79122ffc3/test/internal/getDefaultViewport_test.js
    /**
     * Creates a new viewport object containing default values for the image and canvas
     *
     * @param canvas
     * @param image
     */
    function getDefaultViewport(canvas: HTMLCanvasElement | {} | undefined, image?: Image): Viewport;
    
    /**
     * Sets new default values for `getDefaultViewport`
     *
     * @param viewport Object that sets new default values for getDefaultViewport
     */
    function setDefaultViewport(viewport: Viewport): void;
    
    /**
     * This function transforms stored pixel values into a canvas image data buffer by using a LUT. This is the most performance sensitive code in cornerstone and we use a special trick to make this go as fast as possible. Specifically we use the alpha channel only to control the luminance rather than the red, green and blue channels which makes it over 3x faster. The canvasImageDataData buffer needs to be previously filled with white pixels.
     *
     * NOTE: Attribution would be appreciated if you use this technique!
     *
     * @param image A Cornerstone Image Object
     * @param lut Lookup table array
     * @param canvasImageData canvasImageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageData(image: Image, lut: number[], canvasImageData: Uint8ClampedArray);
    
    /**
     * This function transforms stored pixel values into a canvas image data buffer by using a LUT.
     *
     * @param image A Cornerstone Image Object
     * @param lut Lookup table array
     * @param canvasImageData canvasImageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageDataRGBA(image: Image, lut: number[], canvasImageData: Uint8ClampedArray);
    
    /**
     * Converts stored color pixel values to display pixel values using a LUT.
     *
     * Note: Skips alpha value for any input image pixel data.
     *
     * @param image A Cornerstone Image Object
     * @param lut Lookup table array
     * @param canvasImageData canvasImageData.data buffer filled with white pixels
     */
    function storedColorPixelDataToCanvasImageData(image: Image, lut: number[], canvasImageData: Uint8ClampedArray);
    
    /**
     *
     * @param image A Cornerstone Image Object
     * @param colorLut Lookup table array
     * @param canvasImageData canvasImageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageDataColorLUT(image: Image, colorLut: colors.LookupTable | number[], canvasImageData: Uint8ClampedArray);
    
    /**
     *
     * @param image A Cornerstone Image Object
     * @param grayscaleLut Lookup table array
     * @param colorLut Lookup table array
     * @param canvasImageData canvasImageData.data buffer filled with white pixels
     */
    function storedPixelDataToCanvasImageDataPseudocolorLUT(image: Image, grayscaleLut: number[], colorLut: colors.LookupTable | number[], canvasImageData: Uint8ClampedArray);
    
    function getTransform(enabledElement: EnabledElement): Transform;
    
    /**
     * Calculate the transform for a Cornerstone enabled element
     *
     * @param enabledElement The Cornerstone Enabled Element
     * @param scale The viewport scale
     * @returns The current transform
     */
    function calculateTransform(enabledElement: EnabledElement, scale?: number): Transform;
    
    class Transform {
      reset: () => void;
      clone: () => Transform;
      multiply: (matrix: Matrix) => void;
      invert: () => void;
      rotate: (rad: number) => void;
      translate: (x: number, y: number) => void;
      scale: (sx: number, sy: number) => void;
      transformPoint: (px: number, py: number) => {x: number, y: number};
    }
  }
  
  /** @link https://docs.cornerstonejs.org/api.html#metadata */
  namespace metaData {
    /**
     * Adds a metadata provider with the specified priority
     *
     * @param provider Metadata provider function
     * @param priority 0 is default/normal, > 0 is high, < 0 is low (optional, default 0)
     */
    function addProvider(provider: Function, priority: number): void;
    
    /**
     * Removes the specified provider
     *
     * @param provider Metadata provider function
     */
    function removeProvider(provider: Function): void;
    
    /**
     * Gets metadata from the registered metadata providers. Will call each one from highest priority to lowest until one responds
     *
     * @param type The type of metadata requested from the metadata store
     * @param imageId The Cornerstone Image Object's imageId
     * @returns The metadata retrieved from the metadata store
     */
    function get(type: string, imageId: string): unknown;
  }
  
  namespace rendering {
    /**
     * API function to render a color image to an enabled element
     *
     * @param enabledElement The Cornerstone Enabled Element to redraw
     * @param invalidated true if pixel data has been invalidated and cached rendering should not be used
     */
    function colorImage(enabledElement: EnabledElement, invalidated: boolean);
    
    /**
     * API function to draw a grayscale image to a given enabledElement
     *
     * @param enabledElement The Cornerstone Enabled Element to redraw
     * @param invalidated true if pixel data has been invalidated and cached rendering should not be used
     */
    function grayscaleImage(enabledElement: EnabledElement, invalidated: boolean);
    
    /**
     * API function to draw a standard web image (PNG, JPG) to an enabledImage
     *
     * @param enabledElement The Cornerstone Enabled Element to redraw
     * @param invalidated true if pixel data has been invalidated and cached rendering should not be used
     */
    function webImage(enabledElement: EnabledElement, invalidated: boolean);
    
    /**
     * API function to draw a pseudo-color image to a given enabledElement
     *
     * @param enabledElement The Cornerstone Enabled Element to redraw
     * @param invalidated true if pixel data has been invalidated and cached rendering should not be used
     */
    function pseudoColorImage(enabledElement: EnabledElement, invalidated: boolean);
    
    /**
     * API function to draw a label map image to a given enabledElement
     *
     * @param enabledElement The Cornerstone Enabled Element to redraw
     * @param invalidated true if pixel data has been invalidated and cached rendering should not be used
     */
    function labelMapImage(enabledElement: EnabledElement, invalidated: boolean);
    
    /**
     * Render the image to the provided canvas immediately.
     *
     * @param canvas The HTML canvas where the image will be rendered.
     * @param image An Image loaded by a Cornerstone Image Loader
     * @param viewport A set of Cornerstone viewport parameters
     * @param options Options for rendering the image (e.g. enable webgl by {renderer: 'webgl'})
     */
    function toCanvas(canvas: HTMLCanvasElement, image: Image, viewport?: Viewport, options?: {renderer?: 'webgl'});
  }
  
  namespace imageCache {
    interface CachedImage {
      loaded: boolean;
      imageId: string;
      sharedCacheKey: string | undefined;
      imageLoadObject: ImageLoadObject;
      timeStamp: number;
      sizeInBytes: number;
    }
    
    const imageCache: {[imageId: string]: CachedImage};
    
    const cachedImages: CachedImage[];
    
    /**
     * Sets the maximum size of cache and purges cache contents if necessary.
     *
     * @param numBytes The maximun size that the cache should occupy.
     */
    function setMaximumSizeBytes(numBytes: number);
    
    /**
     * Puts a new image loader into the cache
     *
     * @param imageId ImageId of the image loader
     * @param imageLoadObject The object that is loading or loaded the image
     */
    function putImageLoadObject(imageId: string, imageLoadObject: ImageLoadObject);
    
    /**
     * Retuns the object that is loading a given imageId
     *
     * @param imageId Image ID
     */
    function getImageLoadObject(imageId: string): ImageLoadObject | undefined;
    
    /**
     * Removes the image loader associated with a given Id from the cache
     *
     * @param imageId Image ID
     */
    function removeImageLoadObject(imageId: string);
    
    /**
     * Gets the current state of the cache
     */
    function getCacheInfo(): {
      maximumSizeInBytes: number;
      cacheSizeInBytes: number;
      numberOfImagesCached: number;
    };
    
    /**
     * Removes all images from cache
     */
    function purgeCache();
    
    /**
     * Updates the space than an image is using in the cache
     *
     * @param imageId Image ID
     * @param newCacheSize New image size
     */
    function changeImageIdCacheSize(imageId: string, newCacheSize: number);
  }
  
  const drawImage: typeof internal.drawImage;
  const generateLut: typeof internal.generateLut;
  const getDefaultViewport: typeof internal.getDefaultViewport;
  const storedPixelDataToCanvasImageData: typeof internal.storedPixelDataToCanvasImageData;
  const storedColorPixelDataToCanvasImageData: typeof internal.storedColorPixelDataToCanvasImageData;
  const storedPixelDataToCanvasImageDataColorLUT: typeof internal.storedPixelDataToCanvasImageDataColorLUT;
  const storedPixelDataToCanvasImageDataPseudocolorLUT: typeof internal.storedPixelDataToCanvasImageDataPseudocolorLUT;
  
  const renderLabelMapImage: typeof rendering.labelMapImage;
  const renderPseudoColorImage: typeof rendering.pseudoColorImage;
  const renderColorImage: typeof rendering.colorImage;
  const renderGrayscaleImage: typeof rendering.grayscaleImage;
  const renderWebImage: typeof rendering.webImage;
  const renderToCanvas: typeof rendering.toCanvas;
  
  /**
   * Converts a point in the canvas coordinate system to the pixel coordinate system system. This can be used to reset tools' image coordinates after modifications have been made in canvas space (e.g. moving a tool by a few cm, independent of image resolution).
   *
   * @param element The Cornerstone element within which the input point lies
   * @param pt The input point in the canvas coordinate system
   * @returns The transformed point in the pixel coordinate system
   */
  function canvasToPixel(element: HTMLElement, pt: {x: number, y: number}): {x: number, y: number};
  
  /**
   * Disable an HTML element for further use in Cornerstone
   *
   * @param element An HTML Element enabled for Cornerstone
   */
  function disable(element: HTMLElement);
  
  /**
   * Sets a new image object for a given element.
   *
   * Will also apply an optional viewport setting.
   *
   * @param element
   * @param image
   * @param viewport
   */
  function displayImage(element: HTMLElement, image: Image, viewport: Viewport);
  
  /**
   * Immediately draws the enabled element
   * @param element An HTML Element enabled for Cornerstone
   */
  function draw(element: HTMLElement);
  
  /**
   * Draw the image immediately
   * @param timestamp The current time for when requestAnimationFrame starts to fire callbacks
   */
  function draw(timestamp: DOMHighResTimeStamp);
  
  /**
   * Draws all invalidated enabled elements and clears the invalid flag after drawing it
   */
  function drawInvalidated();
  
  /**
   * Enable an HTML Element for use in Cornerstone
   *
   * - If there is a Canvas already present within the HTMLElement, and it has the class 'cornerstone-canvas', this function will use this existing Canvas instead of creating a new one. This may be helpful when using libraries (e.g. React, Vue) which don't want third parties to change the DOM.
   *
   * @param element
   * @param options
   */
  function enable(element: HTMLElement, options?: {renderer?: 'webgl'});
  
  /**
   * Retrieves any data for a Cornerstone enabledElement for a specific string dataType
   *
   * @param element An HTML Element enabled for Cornerstone
   * @param dataType A string name for an arbitrary set of data
   * @returns Whatever data is stored for this enabled element
   */
  function getElementData(element: HTMLElement, dataType: string): unknown;
  
  /**
   * Clears any data for a Cornerstone enabledElement for a specific string dataType
   *
   * @param element An HTML Element enabled for Cornerstone
   * @param dataType A string name for an arbitrary set of data
   */
  function removeElementData(element: HTMLElement, dataType: string);
  
  /**
   * Retrieves a Cornerstone Enabled Element object
   *
   * @param element An HTML Element enabled for Cornerstone
   * @returns A Cornerstone Enabled Element
   */
  function getEnabledElement(element: HTMLElement): EnabledElement;
  
  /**
   * Adds a Cornerstone Enabled Element object to the central store of enabledElements
   *
   * @param enabledElement EnabledElement A Cornerstone enabledElement Object
   */
  function addEnabledElement(enabledElement: EnabledElement);
  
  /**
   * Adds a Cornerstone Enabled Element object to the central store of enabledElements
   *
   * @param imageId A Cornerstone Image ID
   * @returns An Array of Cornerstone enabledElement Objects
   */
  function getEnabledElementsByImageId(imageId: string): EnabledElement[];
  
  /**
   * Retrieve all of the currently enabled Cornerstone elements
   *
   * @returns An Array of Cornerstone enabledElement Objects
   */
  function getEnabledElements(): EnabledElement[];
  
  /**
   * Add a layer to a Cornerstone element
   *
   * @param element The DOM element enabled for Cornerstone
   * @param image A Cornerstone Image object to add as a new layer
   * @param options Options for the layer
   * @returns layerId The new layer's unique identifier
   */
  function addLayer(element: HTMLElement, image: Image, options: LayerOptions): string;
  
  /**
   * Remove a layer from a Cornerstone element given a layer ID
   *
   * @param element The DOM element enabled for Cornerstone
   * @param layerId The unique identifier for the layer
   */
  function removeLayer(element: HTMLElement, layerId: string);
  
  /**
   * Retrieve a layer from a Cornerstone element given a layer ID
   *
   * @param element The DOM element enabled for Cornerstone
   * @param layerId The unique identifier for the layer
   * @returns The layer
   */
  function getLayer(element: HTMLElement, layerId: string): EnabledElementLayer;
  
  /**
   * Retrieve all layers for a Cornerstone element
   *
   * @param element The DOM element enabled for Cornerstone
   * @returns An array of layers
   */
  function getLayers(element: HTMLElement): EnabledElementLayer[];
  
  /**
   * Retrieve all visible layers for a Cornerstone element
   *
   * @param element The DOM element enabled for Cornerstone
   * @returns An array of layers
   */
  function getVisibleLayers(element: HTMLElement): EnabledElementLayer[];
  
  /**
   * Set the active layer for a Cornerstone element
   *
   * @param element The DOM element enabled for Cornerstone
   * @param layerId The unique identifier for the layer
   */
  function setActiveLayer(element: HTMLElement, layerId: string);
  
  /**
   * Retrieve the currently active layer for a Cornerstone element
   *
   * @param element The DOM element enabled for Cornerstone
   * @returns The currently active layer
   */
  function getActiveLayer(element: HTMLElement): EnabledElementLayer;
  
  /**
   * Purge the layers
   *
   * @param element The DOM element enabled for Cornerstone
   */
  function purgeLayers(element: HTMLElement): void;
  
  /**
   * Set a new image for a specific layerId
   *
   * @param element The DOM element enabled for Cornerstone
   * @param image The image to be displayed in this layer
   * @param layerId The unique identifier for the layer
   */
  function setLayerImage(element: HTMLElement, image: Image, layerId?: string);
  
  /**
   * Adjusts an image's scale and translation so the image is centered and all pixels in the image are viewable.
   *
   * @param element The Cornerstone element to update
   */
  function fitToWindow(element: HTMLElement);
  
  /**
   * Returns a default viewport for display the specified image on the specified enabled element. The default viewport is fit to window
   *
   * @param element The DOM element enabled for Cornerstone
   * @param image A Cornerstone Image Object
   * @returns The default viewport for the image
   */
  function getDefaultViewportForImage(element: HTMLElement, image: Image): Viewport;
  
  const setDefaultViewport: typeof internal.setDefaultViewport;
  
  /**
   * Returns the currently displayed image for an element or undefined if no image has been displayed yet
   *
   * @param element The DOM element enabled for Cornerstone
   * @returns The Cornerstone Image Object displayed in this element
   */
  function getImage(element: HTMLElement): Image;
  
  /**
   * Retrieves an array of pixels from a rectangular region with modality LUT transformation applied
   *
   * @param element The DOM element enabled for Cornerstone
   * @param x The x coordinate of the top left corner of the sampling rectangle in image coordinates
   * @param y The y coordinate of the top left corner of the sampling rectangle in image coordinates
   * @param width The width of the of the sampling rectangle in image coordinates
   * @param height The height of the of the sampling rectangle in image coordinates
   * @returns The modality pixel value of the pixels in the sampling rectangle
   */
  function getPixels(element: HTMLElement, x: number, y: number, width: number, height: number): number[];
  
  /**
   * Retrieves an array of stored pixel values from a rectangular region of an image
   *
   * @param element The DOM element enabled for Cornerstone
   * @param x The x coordinate of the top left corner of the sampling rectangle in image coordinates
   * @param y The y coordinate of the top left corner of the sampling rectangle in image coordinates
   * @param width The width of the of the sampling rectangle in image coordinates
   * @param height The height of the of the sampling rectangle in image coordinates
   * @returns The stored pixel value of the pixels in the sampling rectangle
   */
  function getStoredPixels(element: HTMLElement, x: number, y: number, width: number, height: number): number[];
  
  /**
   * Retrieves the viewport for the specified enabled element
   *
   * @param element The DOM element enabled for Cornerstone
   * @returns The Cornerstone Viewport settings for this element, if they exist. Otherwise, undefined
   */
  function getViewport(element: HTMLElement): Viewport | undefined;
  
  /**
   * Loads an image given an imageId and optional priority and returns a promise which will resolve to the loaded image object or fail if an error occurred. The loaded image is not stored in the cache.
   *
   * @param imageId A Cornerstone Image Object's imageId
   * @param options Options to be passed to the Image Loader
   */
  function loadImage(imageId: string, options?: object): Promise<Image>;
  
  /**
   * Loads an image given an imageId and optional priority and returns a promise which will resolve to the loaded image object or fail if an error occurred. The image is stored in the cache.
   *
   * @param imageId A Cornerstone Image Object's imageId
   * @param options Options to be passed to the Image Loader
   * @returns Image Loader Object
   */
  function loadAndCacheImage(imageId: string, options?: object): ImageLoadObject;
  
  /**
   * Registers an imageLoader plugin with cornerstone for the specified scheme
   *
   * @param scheme The scheme to use for this image loader (e.g. 'dicomweb', 'wadouri', 'http')
   * @param imageLoader A Cornerstone Image Loader function
   */
  function registerImageLoader(scheme: string, imageLoader: Function);
  
  /**
   * Registers a new unknownImageLoader and returns the previous one
   *
   * @param imageLoader A Cornerstone Image Loader
   * @returns The previous Unknown Image Loader
   */
  function registerUnknownImageLoader(imageLoader: Function): Function | undefined;
  
  /**
   * Sets the invalid flag on the enabled element and fire an event
   *
   * @param element The DOM element enabled for Cornerstone
   */
  function invalidate(element: HTMLElement);
  
  /**
   * Forces the image to be updated/redrawn for the all enabled elements displaying the specified imageId
   *
   * @param imageId The imageId of the Cornerstone Image Object to redraw
   */
  function invalidateImageId(imageId: string);
  
  /**
   * Converts a point in the page coordinate system to the pixel coordinate system
   *
   * @param element The Cornerstone element within which the input point lies
   * @param pageX The x value in the page coordinate system
   * @param pageY The y value in the page coordinate system
   * @returns The transformed point in the pixel coordinate system
   */
  function pageToPixel(element: HTMLElement, pageX: number, pageY: number): {x: number, y: number};
  
  /**
   * Converts a point in the pixel coordinate system to the canvas coordinate system system. This can be used to render using canvas context without having the weird side effects that come from scaling and non square pixels
   *
   * @param element An HTML Element enabled for Cornerstone
   * @param pt The transformed point in the pixel coordinate system
   * @returns The input point in the canvas coordinate system
   */
  function pixelToCanvas(element: HTMLElement, pt: {x: number, y: number}): {x: number, y: number};
  
  /**
   * Resets the viewport to the default settings
   *
   * @param element An HTML Element enabled for Cornerstone
   */
  function reset(element: HTMLElement);
  
  /**
   * Resizes an enabled element and optionally fits the image to window
   *
   * @param element The DOM element enabled for Cornerstone
   * @param forceFitToWindow true to to force a refit, false to rescale accordingly
   */
  function resize(element: HTMLElement, forceFitToWindow?: boolean);
  
  /**
   * Sets the canvas context transformation matrix to the pixel coordinate system. This allows geometry to be driven using the canvas context using coordinates in the pixel coordinate system
   *
   * @param enabledElement
   * @param context The CanvasRenderingContext2D for the enabledElement's Canvas
   * @param scale Optional scale to apply
   */
  function setToPixelCoordinateSystem(enabledElement: EnabledElement, context: CanvasRenderingContext2D, scale?: number);
  
  /**
   * Sets/updates viewport of a given enabled element
   * @param element DOM element of the enabled element
   * @param viewport Object containing the viewport properties
   */
  function setViewport(element: HTMLElement, viewport?: Viewport);
  
  /**
   * Forces the image to be updated/redrawn for the specified enabled element
   *
   * @param element An HTML Element enabled for Cornerstone
   * @param invalidated Whether or not the image pixel data has been changed, necessitating a redraw (optional, default false)
   */
  function updateImage(element: HTMLElement, invalidated: boolean);
  
  /**
   * Converts the image pixel data into a false color data
   *
   * @deprecated This function is superseded by the ability to set the Viewport parameters to include colormaps.
   * @param image A Cornerstone Image Object
   * @param lookupTable A lookup table Object
   */
  function pixelDataToFalseColorData(image: Image, lookupTable: colors.LookupTable);
  
  const webGL: unknown;
  
  type RGBAArray = [number, number, number, number];
  
  interface Colormap {
    getId: () => string;
    getColorSchemeName: () => string;
    setColorSchemeName: (value: string) => string;
    getNumberOfColors: () => number;
    setNumberOfColors: (numColors: number) => void;
    getColor: (index: number) => RGBAArray;
    getColorRepeating: (index: number) => RGBAArray;
    setColor: (index: number, rgbs: RGBAArray) => void;
    addColor: (rgba: RGBAArray) => void;
    insertColor: (index: number, rgba: RGBAArray) => void;
    removeColor: (indeX: number) => void;
    clearColor: () => void;
    buildLookupTable: (lut: LUT) => void;
    createLookupTable: () => LUT;
    isValidIndex: (index: number) => boolean;
  }
  
  /**
   * Convert the image of a element to a false color image
   *
   * @param element The Cornerstone element
   * @param colormap it can be a colormap object or a colormap id (string)
   */
  function convertToFalseColorImage(element: HTMLElement, colormap: string | Colormap);
  
  /**
   * Convert an image to a false color image
   *
   * @param image A Cornerstone Image Object
   * @param colormap  it can be a colormap object or a colormap id (string)
   * @returns Whether or not the image has been converted to a false color image
   */
  function convertImageToFalseColorImage(image: Image, colormap: string | Colormap): boolean;
  
  /**
   * Restores a false color image to its original version
   *
   * @param image A Cornerstone Image Object
   * @returns True if the image object had a valid restore function, which was run. Otherwise, false.
   */
  function restoreImage(image: Image): boolean;
  
  /**
   * Trigger a CustomEvent
   *
   * @param el The element or EventTarget to trigger the event upon
   * @param type The event type name
   * @param detail null The event data to be sent (optional, default null)
   */
  function triggerEvent(el: EventTarget, type: EventTypes, detail: CornerstoneEventData | null);
  
  type EventTypes = 'cornerstonenewimage'
    | 'cornerstoneinvalidated'
    | 'cornerstoneprerender'
    | 'cornerstoneimagecachemaximumsizechanged'
    | 'cornerstoneimagecachepromiseremoved'
    | 'cornerstoneimagecachefull'
    | 'cornerstoneimagecachechanged'
    | 'cornerstonewebgltextureremoved'
    | 'cornerstonewebgltexturecachefull'
    | 'cornerstoneimageloaded'
    | 'cornerstoneimageloadfailed'
    | 'cornerstoneelementresized'
    | 'cornerstoneimagerendered'
    | 'cornerstonelayeradded'
    | 'cornerstonelayerremoved'
    | 'cornerstoneactivelayerchanged'
    | 'cornerstoneelementdisabled'
    | 'cornerstoneelementenabled';
  
  enum EVENTS {
    NEW_IMAGE = 'cornerstonenewimage',
    INVALIDATED = 'cornerstoneinvalidated',
    PRE_RENDER = 'cornerstoneprerender',
    IMAGE_CACHE_MAXIMUM_SIZE_CHANGED = 'cornerstoneimagecachemaximumsizechanged',
    IMAGE_CACHE_PROMISE_REMOVED = 'cornerstoneimagecachepromiseremoved',
    IMAGE_CACHE_FULL = 'cornerstoneimagecachefull',
    IMAGE_CACHE_CHANGED = 'cornerstoneimagecachechanged',
    WEBGL_TEXTURE_REMOVED = 'cornerstonewebgltextureremoved',
    WEBGL_TEXTURE_CACHE_FULL = 'cornerstonewebgltexturecachefull',
    IMAGE_LOADED = 'cornerstoneimageloaded',
    IMAGE_LOAD_FAILED = 'cornerstoneimageloadfailed',
    ELEMENT_RESIZED = 'cornerstoneelementresized',
    IMAGE_RENDERED = 'cornerstoneimagerendered',
    LAYER_ADDED = 'cornerstonelayeradded',
    LAYER_REMOVED = 'cornerstonelayerremoved',
    ACTIVE_LAYER_CHANGED = 'cornerstoneactivelayerchanged',
    ELEMENT_DISABLED = 'cornerstoneelementdisabled',
    ELEMENT_ENABLED = 'cornerstoneelementenabled',
  }
  
  const events: EventTarget;
}