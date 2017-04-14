(function (cornerstone) {

    "use strict";

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    function indexOfInObjectArray(array, property, value) {
        var found = -1;
        array.forEach(function(object, index) {
            if (object[property] === value) {
                found = index;
                return false;
            }
        });

        return found;
    }

    function triggerEvent(eventName, enabledElement, layerId) {
        var element = enabledElement.element;
        var eventData = {
            viewport : enabledElement.viewport,
            element : enabledElement.element,
            image : enabledElement.image,
            enabledElement : enabledElement,
            layerId: layerId
        };

        $(element).trigger(eventName, eventData);
    }

    function rescaleImage(baseLayer, targetLayer) {
        var baseImage = baseLayer.image;
        var targetImage = targetLayer.image;
        var baseImagePlane = cornerstone.metaData.get('imagePlane', baseImage.imageId);
        var targetImagePlane = cornerstone.metaData.get('imagePlane', targetImage.imageId);

        if (!baseImagePlane || !baseImagePlane.columnPixelSpacing || 
            !targetImagePlane || !targetImagePlane.columnPixelSpacing) {
            return;
        }

        // Column pixel spacing need to be considered when calculating the
        // ratio between the layer added and base layer images
        var colRelative = (targetImagePlane.columnPixelSpacing * targetImage.width) /
                          (baseImagePlane.columnPixelSpacing * baseImage.width);
        var viewportRatio = targetLayer.viewport.scale / baseLayer.viewport.scale * colRelative;

        targetLayer.viewport.scale = baseLayer.viewport.scale * viewportRatio;
    }

    function addLayer(element, image, options) {
        var layerId = guid();
        var enabledElement = cornerstone.getEnabledElement(element);
        var layers = enabledElement.layers;
        var viewport = cornerstone.internal.getDefaultViewport(enabledElement.canvas, image);

        // Set syncViewports to true by default when a new layer is added
        if (enabledElement.syncViewports !== false) {
            enabledElement.syncViewports = true;
        }

        var newLayer = {
            image: image,
            layerId: layerId,
            viewport: viewport,
            options: options || {}
        };

        // Rescale the new layer based on the base layer to make sure
        // they will have a proportional size (pixel spacing)
        if(layers.length) {
            rescaleImage(layers[0], newLayer);
        }

        layers.push(newLayer);

        // Set the layer as active if it's the first layer added
        if(layers.length === 1) {
            setActiveLayer(element, layers[0].layerId);
        }

        triggerEvent('CornerstoneLayerAdded', enabledElement, layerId);

        return layerId;
    }

    function removeLayer(element, layerId) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var layers = enabledElement.layers;
        var index = indexOfInObjectArray(enabledElement.layers, 'layerId', layerId);

        if (index !== -1) {
            layers.splice(index, 1);
            console.log('Layer removed: ' + layerId);

            if((layerId === enabledElement.activeLayerId) && layers.length) {
                setActiveLayer(element, layers[0].layerId);
            }

            triggerEvent('CornerstoneLayerRemoved', enabledElement, layerId);
        }
    }

    function getLayerById(element, layerId) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var index = indexOfInObjectArray(enabledElement.layers, 'layerId', layerId);

        return enabledElement.layers[index];
    }

    function getLayers(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        return enabledElement.layers;
    }

    function getVisibleLayers(element) {
        var enabledElement = cornerstone.getEnabledElement(element);

        return enabledElement.layers.filter(function(layer) {
            if (layer.options && layer.options.visible !== false && layer.options.opacity !== 0) {
                return true;
            }
        });
    }

    function setActiveLayer(element, layerId) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var index = indexOfInObjectArray(enabledElement.layers, 'layerId', layerId);

        if ((index === -1) || (enabledElement.activeLayerId === layerId)) {
            return;
        }

        var layer = enabledElement.layers[index];

        enabledElement.activeLayerId = layerId;
        enabledElement.image = layer.image;
        enabledElement.viewport = layer.viewport;

        cornerstone.updateImage(element);
        triggerEvent('CornerstoneActiveLayerChanged', enabledElement, layerId);
    }

    function getActiveLayer(element) {
        var enabledElement = cornerstone.getEnabledElement(element);
        var index = indexOfInObjectArray(enabledElement.layers, 'layerId', enabledElement.activeLayerId);

        if(index !== -1) {
            return enabledElement.layers[index];
        }
    }

    // module/private exports
    cornerstone.addLayer = addLayer;
    cornerstone.removeLayer = removeLayer;
    cornerstone.getLayers = getLayers;
    cornerstone.getLayerById = getLayerById;
    cornerstone.setActiveLayer = setActiveLayer;
    cornerstone.getActiveLayer = getActiveLayer;
    cornerstone.getVisibleLayers = getVisibleLayers;

}(cornerstone));
