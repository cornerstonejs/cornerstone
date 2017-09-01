import { assert } from 'chai';

import resize from '../src/resize.js';
import enable from '../src/enable.js';
import disable from '../src/disable.js';
import pubSub from '../src/pubSub.js';

describe('resize canvas to parent element module', function () {
  it('should fire CornerstoneElementResized', function (done) {
    const element = document.createElement('div');

    enable(element, {});

    pubSub(element).subscribe('CornerstoneElementResized', function () {
      assert.isOk(true);
      done();
    });

    resize(element, false);

    disable(element);
  });
});
