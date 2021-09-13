---
description: Cornerstone stores Images inside the Image Cache to keep track of memory usage.
---

# Image Cache

> Cornerstone stores **[Images](../concepts/images.md)** inside the **Image Cache** to keep track of memory usage.

When the Promise within an [Image Load Object](../api.md#imageloadobject) resolves, the resulting Image is stored in an Object in the Image Cache module by Cornerstone. This is set up to operate as a least-recently-used (LRU) cache.

Initially, when [loadImage](../api.md#loadimage) is called, the cache is populated with a placeholder for the cached image with a recorded size of 0. When the Promise tracking the image loading has resolved, the recorded size is updated with the actual size in bytes. If the loading fails, the placeholder is removed from the cache.

Developers can:
  * Set the maximum cache size, default 1 GB ([setMaximumSizeBytes](../api.md#setmaximumsizebytes))
  * Manually purge the cache of all images ([purgeCache](../api.md#purgecache))
  * Retrieve a summary of the cache ([getCacheInfo](../api.md#getcacheinfo))
  * Change the recorded cache size of a specific Image ([changeImageIdCacheSize](../api.md#changeimageidcachesize))
