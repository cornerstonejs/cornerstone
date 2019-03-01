import triggerEvent from '../triggerEvent.js';
import EVENTS from '../events.js';
import drawImageSync from './drawImageSync.js';

const throttledDrawImageWait = 1000 / 60;
// map an view element to a throttled DrawImage function
const throttledDrawImageMap = new Map(); 

function drawImageUnthrottled (enabledElement) {
  const eventDetails = {
    enabledElement,
    timestamp: performance.now()
  };

  triggerEvent(enabledElement.element, EVENTS.PRE_RENDER, eventDetails);

  if (enabledElement && enabledElement.canvas && (enabledElement.image || enabledElement.layers.length > 0)) {
    drawImageSync(enabledElement, enabledElement.invalid);
  }
}


/**
 * Draw an image to a given enabled element asynchronously and throttled
 *
 * @param {EnabledElement} enabledElement An enabled element to draw into
 * @returns {void}
 * @memberof Internal
 */
export default function drawImageAsync (enabledElement) {
  if (enabledElement === undefined) {
    return;
  }

  let throttledDrawImage = throttledDrawImageMap.get(enabledElement.element);

  if (!throttledDrawImage) {
    throttledDrawImage = throttle(drawImageUnthrottled, throttledDrawImageWait);
    throttledDrawImageMap.set(enabledElement.element, throttledDrawImage);
  }

  throttledDrawImage(enabledElement);
}

/* eslint-disable */

/* Creates a debounced function that delays invoking `func` until after `wait`
	 * milliseconds have elapsed since the last time the debounced function was
	 * invoked. The debounced function comes with a `cancel` method to cancel
	 * delayed `func` invocations and a `flush` method to immediately invoke them.
	 * Provide `options` to indicate whether `func` should be invoked on the
	 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	 * with the last arguments provided to the debounced function. Subsequent
	 * calls to the debounced function return the result of the last `func`
	 * invocation.
	 *
	 * **Note:** If `leading` and `trailing` options are `true`, `func` is
	 * invoked on the trailing edge of the timeout only if the debounced function
	 * is invoked more than once during the `wait` timeout.
	 *
	 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	 *
	 * from lodash - https://github.com/lodash/lodash/blob/4.16.2/lodash.js#L10218
	 */
function debounce(func, wait, options) {
  if (!options) options = {};

  let lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0,
    leading = false,
    maxing = false,
    trailing = true;

  wait = wait || 0;
  leading = !!options.leading;
  maxing = 'maxWait' in options;
  maxWait = maxing ? Math.max(options.maxWait || 0, wait) : maxWait;
  trailing = 'trailing' in options ? !!options.trailing : trailing;

  function invokeFunc(time) {
    const args = lastArgs,
      thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime,
      result = wait - timeSinceLastCall;

    return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(...args) {
    const time = Date.now(),
      isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}


/* Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
*/
function throttle(func, wait, options) {
  if (!options) options = {};
  let leading = true,
    trailing = true;

  leading = 'leading' in options ? !!options.leading : leading;
  trailing = 'trailing' in options ? !!options.trailing : trailing;

  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/* eslint-enable */
