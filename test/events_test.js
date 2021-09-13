import { assert } from 'chai'; // eslint-disable-line import/extensions
import { events } from '../src/events.js';

const fakeEventName = 'fake_event';

function clearEventType (eventType) {
  events.listeners[eventType] = [];
}

describe('EventTarget', function () {
  beforeEach(function () {
    clearEventType(fakeEventName);
  });

  it('should trigger event properly', function (done) {
    const expectedEvent = new CustomEvent(fakeEventName, {});
    let handlerCalled = false;

    function handler (event) {
      handlerCalled = true;
      assert.equal(event, expectedEvent);
    }

    events.addEventListener(fakeEventName, handler);
    events.dispatchEvent(expectedEvent);

    assert.isTrue(handlerCalled, 'handler should be called');
    done();
  });

  it('should not call listener after removal', function (done) {
    const expectedEvent = new CustomEvent(fakeEventName, {});
    let handlerCalled = false;

    function handler () {
      handlerCalled = true;
    }

    events.addEventListener(fakeEventName, handler);
    events.removeEventListener(fakeEventName, handler);
    events.dispatchEvent(expectedEvent);

    assert.isFalse(handlerCalled, 'handler should not be called');
    done();
  });

  it('should trigger all listener even if a self-removal happens', function (done) {
    const expectedEvent = new CustomEvent(fakeEventName, {});
    let handler1called = false;
    let handler2called = false;
    let handler3called = false;

    function handler1 () {
      handler1called = true;
    }
    function handler2 () {
      handler2called = true;
      events.removeEventListener(fakeEventName, handler2);
    }
    function handler3 () {
      handler3called = true;
    }

    events.addEventListener(fakeEventName, handler1);
    events.addEventListener(fakeEventName, handler2);
    events.addEventListener(fakeEventName, handler3);
    events.dispatchEvent(expectedEvent);

    assert.isTrue(handler1called, 'handler1 should be called');
    assert.isTrue(handler2called, 'handler2 should be called');
    assert.isTrue(handler3called, 'handler3 should be called');

    done();
  });
});
