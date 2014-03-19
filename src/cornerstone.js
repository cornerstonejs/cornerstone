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
        for(var property in ee.viewport) {
            var str = property + ' = ' + ee.viewport[property];
            context.fillText(str, 10, y);
            y+=30;
        }
        context.scale(ee.viewport.scale, ee.viewport.scale);
        context.translate(ee.viewport.left, ee.viewport.top);
        context.beginPath();
        context.rect(0, 0, ee.canvas.width, ee.canvas.height);
        context.strokeStyle = "white";
        context.lineWidth = 0;
        context.moveTo(0,0);
        context.lineTo(ee.canvas.width, ee.canvas.height);
        context.moveTo(ee.canvas.width,0);
        context.lineTo(0, ee.canvas.height);
        context.stroke();
        context.restore();

    };

    cornerstone.config = function () {
    };

    cornerstone.enable = function (element, studyId, imageId) {
        var canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        element.appendChild(canvas);
        var el = {
            element: element,
            canvas: canvas,
            ids : {
                studyId: studyId,
                imageId: imageId
            },
            viewport : {
                scale : 1.0,
                top : 0.0,
                left: 0.0,
                windowWidth: 256,
                windowCenter: 128
            }
        };
        enabledElements.push(el);
        updateImage(element);
    };



    cornerstone.showImage = function (element, studyId, imageId) {
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

    function enableAllElements()
    {
        var ees = document.querySelectorAll('[data-cornerstoneEnabled]');
        for(var i=0; i < ees.length; i++) {
            var ee = ees[i];
            var studyId = ee.getAttribute('data-cornerstoneStudyId');
            var imageId = ee.getAttribute('data-cornerstoneImageId');
            cornerstone.enable(ee, studyId, imageId);
        }
    }
    enableAllElements();

    return cornerstone;
}());