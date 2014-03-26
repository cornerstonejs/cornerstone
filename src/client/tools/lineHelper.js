var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    function sqr(x) { return x * x }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    function distToSegmentSquared(p, v, w) {
        var l2 = dist2(v, w);
        if (l2 == 0) return dist2(p, v);
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return dist2(p, v);
        if (t > 1) return dist2(p, w);
        return dist2(p, { x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }


    function pointNearLineSegment(point, lineSegment, maxDistance)
    {
        if(maxDistance === undefined) {
            maxDistance = 5;
        }
        var distance = distToSegment(point, lineSegment.start, lineSegment.end);

        return (distance < maxDistance);
    }

    function rectToLineSegments(rect)
    {
        var top = {
            start : {
                x :rect.left,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top

            }
        };
        var right = {
            start : {
                x :rect.left + rect.width,
                y :rect.top
            },
            end : {
                x :rect.left + rect.width,
                y :rect.top + rect.height

            }
        };
        var bottom = {
            start : {
                x :rect.left + rect.width,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top + rect.height

            }
        };
        var left = {
            start : {
                x :rect.left,
                y :rect.top + rect.height
            },
            end : {
                x :rect.left,
                y :rect.top

            }
        };
        var lineSegments = [top, right, bottom, left];
        return lineSegments;
    }

    function pointNearRect(point, rect, maxDistance)
    {
        var found = false;
        var lineSegments = rectToLineSegments(rect);
        lineSegments.forEach(function(lineSegment) {
            if(pointNearLineSegment(point, lineSegment, maxDistance))
            {
                found = true;
            }
        })
        return found;
    }

    // module exports
    cornerstoneTools.lineHelper = {
        pointNearLineSegment: pointNearLineSegment,
        pointNearRect: pointNearRect,
    }

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));