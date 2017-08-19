import resize from '../src/resize.js';
import enable from '../src/enable.js';
import pubSub from '../src/pubSub.js';

describe('resize canvas to parent element module', function () {
  it('should fire CornerstoneElementResized', function (done) {
    const element = document.createElement('div');

    enable(element, {});

    const token = pubSub(element).subscribe('CornerstoneElementResized', function () {
      pubSub(element).unsubscribe(token);
      done();
    });

    resize(element, false);
  });
});
