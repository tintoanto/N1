import _ from 'underscore'
import NylasStore from 'nylas-store'
import {Actions} from 'nylas-exports'

/** Keeps track of SmartComponents
 *
 * If the Contenteditable detects new smart component tags, it'll update the store.
 */
class SmartComponentStore extends NylasStore {

  ANCHOR_CLASS = "n1-smart-component-anchor-container";

  WRAP_CLASS = "n1-smart-component-wrap"

  constructor() {
    super();
    this._registeredComponents = {}
    this._mountedComponentRects = {}
  }

  registerSmartComponent = (id, component, props) => {
    this._registeredComponents[id] = {component, props}
    // We don't trigger here since we wait for the DOM to update and
    // refresh us via setMountedState
  }

  getComponent(id) {
    return this._registeredComponents[id]
  }

  getMountedRect(id) {
    return this._mountedComponentRects[id]
  }

  mountedIds() {
    return Object.keys(this._mountedComponentRects);
  }

  // mountedComponentRects() {
  //   return this._mountedComponentRects
  // }

  setMountedState(mountedState) {
    const oldIds = Object.keys(this._mountedComponentRects)
    const removedIds = _.difference(oldIds, Object.keys(mountedState))

    for (const id of removedIds) {
      delete this._mountedComponentRects[id]
    }

    this._mountedComponentRects = mountedState;
    this.trigger();
  }

  // mountSmartComponent(id) {
  //   this._mountedComponentRects[id] = this._registeredComponents[id]
  // }
  //
  // unmountSmartComponent(id) {
  //   delete this._mountedComponentRects[id]
  // }

  // unregisterSmartComponent = (id) => {
  //   delete this._registeredComponents[id]
  // }
}
const store = new SmartComponentStore();
export default store
