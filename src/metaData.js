// This module defines a way to access various metadata about an imageId.  This layer of abstraction exists
// So metadata can be provided in different ways (e.g. by parsing DICOM P10 or by a WADO-RS document)

const providers = [];

/**
 * Adds a metadata provider with the specified priority
 * @param provider
 * @param priority - 0 is default/normal, > 0 is high, < 0 is low
 */
export function addProvider (provider, priority) {
  priority = priority || 0; // Default priority

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
 * @param provider
 */
export function removeProvider (provider) {
  for (let i = 0; i < providers.length; i++) {
    if (providers[i].provider === provider) {
      providers.splice(i, 1);

      return;
    }
  }
}

/**
 * Gets metadata from the registered metadata providers.  Will call each one from highest priority to lowest
 * until one responds
 *
 * @param type
 * @param imageId
 */
function getMetaData (type, imageId) {
  // Invoke each provider in priority order until one returns something
  for (let i = 0; i < providers.length; i++) {
    const result = providers[i].provider(type, imageId);

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
