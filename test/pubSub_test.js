import { assert } from 'chai';

import pubSub from '../src/pubSub';

describe('pub/sub module', function () {
  beforeEach(function () {
    this.element1 = document.createElement('div');
    this.element2 = document.createElement('div');

    this.element1.id = 'Element1';
    this.element2.id = 'Element2';

    this.topic = 'topic';
    this.args = 'args';
  });

  it('allows to publish to subscribers', function (done) {
    const that = this;
    const token = pubSub(this.element1).subscribe(this.topic, function (topic, args) {
      pubSub(this.element1).unsubscribe(token);

      assert.equal(topic, that.topic);
      assert.equal(args, that.args);
      done();
    });

    pubSub(this.element1).publish(this.topic, this.args);
  });

  it('allows to unsubscribe', function () {
    const token = pubSub(this.element1).subscribe(this.topic, function () {
      pubSub(this.element1).unsubscribe(token);

      assert.isOk(false, 'should not be called as not subscribed');
    });

    pubSub(this.element1).unsubscribe(token);

    pubSub(this.element1).publish(this.topic, this.args);
  });

  it('works with multiple objects as elements', function () {
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');

    const token = pubSub(element1).subscribe(this.topic, function () {});

    assert.equal(Object.keys(pubSub(element1).topics).length, 1);
    assert.equal(Object.keys(pubSub(element2).topics).length, 0);

    pubSub(this.element1).unsubscribe(token);
  });
});
