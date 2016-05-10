import _ from 'underscore'
import NylasStore from 'nylas-store'
import {Actions} from 'nylas-exports'

/** Keeps track of OverlayedComponents
 *
 * If the Contenteditable detects new smart component tags, it'll update the store.
 */
class OverlayedComponentStore extends NylasStore {

  // The "Anchor" is the element we place in the actual contenteditable
  // component to keep track of where we should overlay the main
  // component.
  ANCHOR_CLASS = "n1-overlayed-component-anchor-container";

  // The "Wrap" is the container we place the component in. It's
  // absolutely positioned on top of the "Anchor"
  WRAP_CLASS = "n1-overlayed-component-wrap"

  constructor() {
    super();
    this._overlayedComponents = {}
    this._mountedAnchorRects = {}
  }

  registerOverlayedComponent = (id, component, props) => {
    this._overlayedComponents[id] = {component, props}
    // We don't trigger here since we wait for the DOM to update and
    // refresh us via setMountedState
  }

  getOverlayedComponent(id) {
    return this._overlayedComponents[id]
  }

  getAnchorRect(id) {
    return this._mountedAnchorRects[id]
  }

  mountedIds() {
    return Object.keys(this._mountedAnchorRects);
  }

  // mountedAnchorRects() {
  //   return this._mountedAnchorRects
  // }

  setMountedState(mountedState) {
    const oldIds = Object.keys(this._mountedAnchorRects)
    const removedIds = _.difference(oldIds, Object.keys(mountedState))

    for (const id of removedIds) {
      delete this._mountedAnchorRects[id]
    }

    this._mountedAnchorRects = mountedState;
    this.trigger();
  }

  // mountOverlayedComponent(id) {
  //   this._mountedAnchorRects[id] = this._overlayedComponents[id]
  // }
  //
  // unmountOverlayedComponent(id) {
  //   delete this._mountedAnchorRects[id]
  // }

  // unregisterOverlayedComponent = (id) => {
  //   delete this._overlayedComponents[id]
  // }
}
const store = new OverlayedComponentStore();
export default store
