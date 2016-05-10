import _ from 'underscore'
import NylasStore from 'nylas-store'
import ReactDOM from 'react-dom'

/** Keeps track of OverlaidComponents
 *
 * If the Contenteditable detects new smart component tags, it'll update the store.
 */
class OverlaidComponentStore extends NylasStore {

  // The "Anchor" is the element we place in the actual contenteditable
  // component to keep track of where we should overlay the main
  // component.
  ANCHOR_CLASS = "n1-overlaid-component-anchor-container";

  // The "Wrap" is the container we place the component in. It's
  // absolutely positioned on top of the "Anchor"
  WRAP_CLASS = "n1-overlaid-component-wrap"

  constructor() {
    super();
    this._overlaidComponents = {}
    this._mountedAnchorRects = {}
    this.triggerSoon = _.debounce(this.trigger, 10)
  }

  registerOverlaidComponent = (id, component, props) => {
    this._overlaidComponents[id] = {component, props}
    // We don't trigger here since we wait for the DOM to update and
    // refresh us via setAnchorState
    return this.decorateComponent(id, component)
  }

  // The Anchors in the Contenteditable need to update whenever an
  // overlaid component updates (and changes its size). We decorate
  // the overlaid component to listen to its changes.
  decorateComponent(id, component) {
    const didMount = component.prototype.componentDidMount || (() => {})
    const didUpdate = component.prototype.componentDidUpdate || (() => {})
    const willUnmount = component.prototype.componentWillUnmount || (() => {})

    const store = this;

    // We need the binding context of the function
    const didMountFn = function componentDidMount(...args) {
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      store.getOverlaidComponent(id).rect = rect
      store.triggerSoon()
      return didMount.apply(this, args)
    }

    const didUpdateFn = function componentDidUpdate(...args) {
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      store.getOverlaidComponent(id).rect = rect
      store.triggerSoon()
      return didUpdate.apply(this, args)
    }

    const willUnmountFn = function componentWillUnmount(...args) {
      delete store.getOverlaidComponent(id).rect
      return willUnmount.apply(this, args)
    }

    component.prototype.componentDidMount = didMountFn;
    component.prototype.componentDidUpdate = didUpdateFn;
    component.prototype.componentWillUnmount = willUnmountFn;

    return component
  }

  getOverlaidComponent(id) {
    return this._overlaidComponents[id]
  }

  getOverlaidComponentRects() {
    const rects = {}
    for (const key of Object.keys(this._overlaidComponents)) {
      if (this._overlaidComponents[key].rect) {
        rects[key] = this._overlaidComponents[key]
      }
    }
    return rects;
  }

  getAnchorRect(id) {
    return this._mountedAnchorRects[id]
  }

  getAnchorRects() {
    return this._mountedAnchorRects
  }

  anchorIds() {
    return Object.keys(this._mountedAnchorRects);
  }

  // mountedAnchorRects() {
  //   return this._mountedAnchorRects
  // }

  setAnchorState(mountedState) {
    const oldIds = Object.keys(this._mountedAnchorRects)
    const removedIds = _.difference(oldIds, Object.keys(mountedState))

    for (const id of removedIds) {
      delete this._mountedAnchorRects[id]
    }

    this._mountedAnchorRects = mountedState;

    this.trigger();
  }

  // mountOverlaidComponent(id) {
  //   this._mountedAnchorRects[id] = this._overlaidComponents[id]
  // }
  //
  // unmountOverlaidComponent(id) {
  //   delete this._mountedAnchorRects[id]
  // }

  // unregisterOverlaidComponent = (id) => {
  //   delete this._overlaidComponents[id]
  // }
}
const store = new OverlaidComponentStore();
export default store
