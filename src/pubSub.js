/**
 * This module provides a simple pub/sub implementation.
 * Original code by https://gist.github.com/fatihacet/1290216
 */

class PubSub {
  constructor (element) {
    this.element = element;
    this.subUid = -1;
    this.topics = {};
  }

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

  unsubscribe (token) {
    for (const m in this.topics) {
      if (this.topics[m]) {
        for (let i = 0, j = this.topics[m].length; i < j; i++) {
          if (this.topics[m][i].token === token) {
            this.topics[m].splice(i, 1);

            return token;
          }
        }
      }
    }

    return false;
  }

  unsubscribeAll () {
    for (const i in this.topics) {
      this.topics[i].length = 0;
    }

    Object.keys(this.topics).forEach((key) => {
      delete this.topics[key];
    });
  }

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

export default function (element) {
  if (!element) {
    return globalInstance;
  }

  if (!instances.has(element)) {
    instances.set(element, new PubSub(element));
  }

  return instances.get(element);
}
