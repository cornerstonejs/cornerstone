// This module defines a way to access various metadata about an imageId.  This layer of abstraction exists
// So metadata can be provided in different ways (e.g. by parsing DICOM P10 or by a WADO-RS document)

const providers = [];

/**
 * @module Metadata
 */

/**
 * Adds a metadata provider with the specified priority
 * @param {Function} provider Metadata provider function
 * @param {Number} [priority=0] - 0 is default/normal, > 0 is high, < 0 is low
 *
 * @returns {void}
 * @memberof Metadata
 */
export function addProvider (provider, priority = 0) {
  let i;

  // Find the right spot to insert this provider based on priority
  for (i = 0; i < providers.length; i++) {
    if (providers[i].priority <= priority) {
      break;
    }
  }

  // Insert the decode task at position i
  providers.splice(i, 0, {
    priority,
    provider
  });
}

/**
 * Removes the specified provider
 *
 * @param {Function} provider Metadata provider function
 *
 * @returns {void}
 * @memberof Metadata
 */
export function removeProvider (provider) {
  for (let i = 0; i < providers.length; i++) {
    if (providers[i].provider === provider) {
      providers.splice(i, 1);

      break;
    }
  }
}

/**
 * Gets metadata from the registered metadata providers.  Will call each one from highest priority to lowest
 * until one responds
 *
 * @param {String} type The type of metadata requested from the metadata store
 * @param {String} imageId The Cornerstone Image Object's imageId
 * @param {DataSet} [dataSet] The dataSet from which to extract the metadata
 *
 * @returns {*} The metadata retrieved from the metadata store
 * @memberof Metadata
 */
function getMetaData (type, imageId, dataSet) {
  // Invoke each provider in priority order until one returns something
  for (let i = 0; i < providers.length; i++) {
    const result = providers[i].provider(type, imageId, dataSet);

    if (result !== undefined) {
      return result;
    }
  }
}

export default {
  addProvider,
  removeProvider,
  get: getMetaData
};
