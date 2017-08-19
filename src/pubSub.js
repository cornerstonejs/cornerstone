/**
 * This module provides a simple pub/sub implementation.
 * Original code by https://gist.github.com/fatihacet/1290216
 */

class PubSub {
  constructor () {
    this.subUid = -1;
    this.topics = {};
  }

  subscribe (topic, func) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    const token = (++this.subUid).toString();

    this.topics[topic].push({
      token,
      func
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

  publish (topic, args) {
    if (!this.topics[topic]) {
      return false;
    }

    const subscribers = this.topics[topic];
    let len = subscribers ? subscribers.length : 0;

    while (len--) {
      subscribers[len].func(topic, args);
    }

    return true;
  }
}

const instances = new Map();

export default function (element) {
  if (!instances.has(element)) {
    instances.set(element, new PubSub());
  }

  return instances.get(element);
}
