var cornerstone = (function () {
    var cornerstone = {};

    var enabledElements = [];

    function getEnabledElement(element) {
        for(var i=0; i < enabledElements.length; i++) {
            if(enabledElements[i].element == element) {
                return enabledElements[i];
            }
        }
        return undefined;
    }

    function updateImage(element) {
        var ee = getEnabledElement(element);
        var y = 30;
        var context = ee.canvas.getContext('2d');
        context.fillStyle = 'black';
        context.fillRect(0,0, ee.canvas.width, ee.canvas.height);
        context.save();
        context.fillStyle = 'white';
        context.fillText(ee.ids.studyId, 10, y);
        y+=30;
        context.fillText(ee.ids.imageId, 10, y);
        y+=30;
        for(var property in ee.viewport) {
            var str = property + ' = ' + ee.viewport[property];
            context.fillText(str, 10, y);
            y+=30;
        }
        context.scale(ee.viewport.scale, ee.viewport.scale);
        context.translate(-ee.image.width/2, -ee.image.height / 2);
        context.translate(ee.viewport.centerX, ee.viewport.centerY);
        context.beginPath();
        context.rect(0, 0, ee.image.width, ee.image.height);
        context.strokeStyle = "white";
        context.lineWidth = 0;
        context.moveTo(0,0);
        context.lineTo(ee.image.width, ee.image.height);
        context.moveTo(ee.image.width,0);
        context.lineTo(0, ee.image.height);
        context.stroke();
        context.restore();

    };

    cornerstone.config = function () {
    };

    cornerstone.enable = function (element, studyId, imageId, viewportOptions) {
        var canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        element.appendChild(canvas);

        var viewport = {
            scale : 1.0,
            centerX : 256.0,
            centerY: 256.0,
            windowWidth: 256,
            windowCenter: 128
        };
        // merge
        if(viewportOptions) {
            for(var attrname in viewportOptions)
            {
                if(viewportOptions[attrname] !== null) {
                    viewport[attrname] = viewportOptions[attrname];
                }
            }
        }

        var el = {
            element: element,
            canvas: canvas,
            ids : {
                studyId: studyId,
                imageId: imageId
            },
            image: {
                width: 512,
                height: 512
            },
            viewport : viewport
        };
        enabledElements.push(el);
        updateImage(element);
    };



    cornerstone.showImage = function (element, studyId, imageId, viewportOptions) {
        enabledElement = getEnabledElement(element);
        enabledElement.ids.studyId = studyId;
        enabledElement.ids.imageId = imageId;
        // merge
        if(viewportOptions) {
            for(var attrname in viewportOptions)
            {
                if(viewportOptions[attrname] !== null) {
                    enabledElement.viewport[attrname] = viewportOptions[attrname];
                }
            }
        }
        updateImage(element);
    };


    cornerstone.setViewport= function (element, viewport) {
        enabledElement = getEnabledElement(element);
        enabledElement.viewport = viewport;
        updateImage(element);
    };

    cornerstone.getViewport= function (element) {
        return getEnabledElement(element).viewport;

    };

    function getAttribute(ee, attrName) {
        var attr = ee.getAttribute(attrName);
        if(attr === undefined) {
            return undefined;
        }
        return attr;
    }

    function enableAllElements()
    {
        var ees = document.querySelectorAll('[data-cornerstoneEnabled]');
        for(var i=0; i < ees.length; i++) {
            var ee = ees[i];
            var studyId = ee.getAttribute('data-cornerstoneStudyId');
            var imageId = ee.getAttribute('data-cornerstoneImageId');

            var viewport =
            {
                scale : getAttribute(ee, 'data-cornerstoneViewportScale'),
                centerX : getAttribute(ee, 'data-cornerstoneViewportCenterX'),
                centerY : getAttribute(ee, 'data-cornerstoneViewportCenterY'),
                windowWidth : getAttribute(ee, 'data-cornerstoneViewportWindowWidth'),
                windowCenter : getAttribute(ee, 'data-cornerstoneViewportWindowCenter')
            };
            cornerstone.enable(ee, studyId, imageId, viewport);
        }
    }
    enableAllElements();

    return cornerstone;
}());