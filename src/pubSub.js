/**
 * This module provides a simple pub/sub implementation.
 * Original code by https://gist.github.com/fatihacet/1290216
 */

/**
 * The PubSub class that handles the publication and subscriptions of one
 * element.
 */
class PubSub {

  /**
   * Create a PubSub object to publish and subscribe to events.
   * @param {*} element The element this PubSub instance is associated with
   *                    (may be undefined if this is the global PubSub instance).
   */
  constructor (element) {
    this.element = element;
    this.subUid = -1;
    this.topics = {};
  }

  /**
   * Subscribe to events.
   * @param {string} topic The event topic to subscribe to.
   * @param {function} func The callback that is called when this event happens.
   * @param {*} extras An optional argument that is passed to the func callback.
   *
   * @return {string} A unique token that can be used to unsubsribe from this subscription.
   */
  subscribe (topic, func, extras) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    const token = (++this.subUid).toString();

    this.topics[topic].push({
      token,
      func,
      extras
    });

    return token;
  }

  /**
   * Unsubscribe from events.
   * @param {string} token The token got during subscription.
   *
   * @return {bool} True if unsubscribed successfully, false if never subscribed.
   */
  unsubscribe (token) {
    for (const key in this.topics) {
      if (!this.topics[key]) {
        continue;
      }

      for (let i = 0, j = this.topics[key].length; i < j; i++) {
        if (this.topics[key][i].token === token) {
          this.topics[key].splice(i, 1);

          if (this.topics[key].length === 0) {
            delete this.topics[key];
          }

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Unsubscribe from all event topics.
   *
   * @return {void}
   */
  unsubscribeAll () {
    for (const i in this.topics) {
      this.topics[i].length = 0;
    }

    Object.keys(this.topics).forEach((key) => {
      delete this.topics[key];
    });
  }

  /**
   * Publish a new event to all subscribed listeners.
   * @param {string} topic The event topic publish.
   * @param {*} args Arguments that are passed to subscribed listeners.
   *
   * @return {bool} True if the event was successfully published to listeners,
   *                false if no one is listening to this event topic.
   */
  publish (topic, args) {
    if (!this.topics[topic]) {
      return false;
    }

    const subscribers = this.topics[topic];
    let len = subscribers ? subscribers.length : 0;

    while (len--) {
      const subscriber = subscribers[len];

      subscriber.func(topic, args, subscriber.extras);
    }

    return true;
  }
}

const globalInstance = new PubSub();
const instances = new Map();

/**
 * Fetch a pubSub instance.
 * @param {*} element The element for which to fetch the pubSub instance.
 *                    If not provided (or undefined) a global instance is returned.
 *
 * @return {PubSub} A PubSub instance.
 */
export default function (element) {
  if (!element) {
    return globalInstance;
  }

  if (!instances.has(element)) {
    instances.set(element, new PubSub(element));
  }

  return instances.get(element);
}
