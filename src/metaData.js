(function($, cornerstone) {

  'use strict';

  // this module defines a way to access various metadata about an imageId.  This layer of abstraction exists
  // so metadata can be provided in different ways (e.g. by parsing DICOM P10 or by a WADO-RS document)

  var providers = [];

  /**
   * Adds a metadata provider with the specified priority
   * @param provider
   * @param priority - 0 is default/normal, > 0 is high, < 0 is low
   */
  function addProvider(provider, priority) {
    priority = priority || 0; // default priority
    // find the right spot to insert this provider based on priority
    for(var i=0; i < providers.length; i++) {
      if(providers[i].priority <= priority) {
        break;
      }
    }

    // insert the decode task at position i
    providers.splice(i, 0, {
      priority: priority,
      provider: provider
    });

  }

  /**
   * Removes the specified provider
   * @param provider
   */
  function removeProvider( provider) {
    for(var i=0; i < providers.length; i++) {
      if(providers[i].provider === provider) {
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
   * @returns {boolean}
   */
  function getMetaData(type, imageId) {
    // invoke each provider in priority order until one returns something
    for(var i=0; i < providers.length; i++) {
      var result;
      result = providers[i].provider(type, imageId);
      if (result !== undefined) {
        return result;
      }
    }
  }

  // module/private exports
  cornerstone.metaData = {
    addProvider: addProvider,
    removeProvider: removeProvider,
    get: getMetaData
  };

})($, cornerstone);
