var cornerstone = (function (cornerstone, csc) {
    if(cornerstone === undefined) {
        cornerstone = {};
    }

    cornerstone.showImage = function (element, studyId, imageId, viewportOptions) {
        enabledElement = cornerstone.getEnabledElement(element);
        enabledElement.ids.studyId = studyId;
        enabledElement.ids.imageId = imageId;
        enabledElement.image = cornerstone.loadImage(studyId, imageId);

        // merge
        if(viewportOptions) {
            for(var attrname in viewportOptions)
            {
                if(viewportOptions[attrname] !== null) {
                    enabledElement.viewport[attrname] = viewportOptions[attrname];
                }
            }
        }
        cornerstone.updateImage(element);
    };

    return cornerstone;
}(cornerstone, cornerstoneCore));