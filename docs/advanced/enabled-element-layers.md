---
description: Adding Layers to an Enabled Element allows Cornerstone to display labels maps and perform image fusion.
---

# Enabled Element Layers

> Adding **Layers** to an **Enabled Element** allows Cornerstone to display labels maps and perform image fusion.

The [Enabled Element Layers API](../api.md#enabledelementlayers) allows developers to add build a composite set of images with Cornerstone.

Basics:
* An Enabled Element can have more than one Layer.
* Each Layer is similar to an Enabled Element - They each have their own *Image* and *Viewport*, off-screen rendering Canvas, etc...
* Only a single Layer can be active at a time.
* Layers have properties for visibility and opacity, and are uniquely referenced by a Layer ID.

When a Layer is Active:
* The layer's *Image* is available at enabledElement.image
* The layer's *Viewport* is available at enabledElement.viewport

This means that typical functions such as setViewport and getViewport apply to the *active layer*.

Layers can be:
  * Added ([addLayer](../api.md#addlayer))
  * Retrieved individually by Layer ID: [getLayer](../api.md#getLayer)
  * Removed individually by Layer ID: [removeLayer](../api.md#removeLayer)

Additional functions:
* The current active layer can be retrieved [getActiveLayer](../api.md#getActiveLayer)
* The Array of all layers can be retrieved: [getLayers](../api.md#getLayers)
* The Array of all visible layers can be retrieved: [getVisibleLayers](../api.md#getVisibleLayers)
