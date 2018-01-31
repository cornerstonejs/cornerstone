function s4 () {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).
    substring(1);
}

/**
 * Generate a unique identifier
 *
 * @return {string} A unique identifier
 * @memberof Internal
 */
export default function () {
  return `${s4() + s4()}-${s4()}-${s4()}-${
    s4()}-${s4()}${s4()}${s4()}`;
}
