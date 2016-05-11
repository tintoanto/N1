import _ from 'underscore'
import NylasStore from 'nylas-store'
// import ReactDOM from 'react-dom'

import {ListenToChanges} from 'nylas-exports'

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
  WRAP_CLASS = "n1-overlaid-component-wrap";

  IMG_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  constructor() {
    super();
    this._overlaidComponents = {}
    this._mountedAnchorRects = {}
    this.triggerSoon = _.debounce(this.trigger, 10)
  }

  // Need to give it 1px transparent src to prevent a border that
  // ignores all CSS attempts to clear it!
  buildAnchorTag(id) {
    return `<img class="${this.ANCHOR_CLASS}" data-overlay-id="${id}" src="${this.IMG_SRC}">`
  }

  registerOverlaidComponent = (id, component, props) => {
    if (this._overlaidComponents[id]) {
      return
    }

    const decoratedComponent = ListenToChanges(component);
    const extendedProps = Object.assign(props, {
      onMutated: ({rect}) => { this._onUpdateRect(id, rect) },
      onWillUnmount: () => { this._onUpdateRect(id, null) },
    })
    this._overlaidComponents[id] = {
      component: decoratedComponent,
      props: extendedProps,
    }
    // We don't trigger here since we wait for the DOM to update and
    // refresh us via setAnchorState
  }


  // TODO: Need proper unregistration scheme. We want the components to stick
  // around in case you cut and then paste much later. Will likely add a hooke
  // when a draft is destroyed. TODO
  // https://paper.dropbox.com/doc/Composer-Overlaid-Components-FoZrF0cFggzSUZirZ9MNo
  unregisterOverlaidComponent = () => {
    return
  }

  _onUpdateRect(id, rect) {
    this._overlaidComponents[id].rect = _.clone(rect);
    this.triggerSoon()
  }

  getOverlaidComponent(id) {
    return this._overlaidComponents[id]
  }

  getOverlaidComponentRects() {
    const rects = {}
    for (const key of Object.keys(this._overlaidComponents)) {
      if (this._overlaidComponents[key].rect) {
        rects[key] = _.clone(this._overlaidComponents[key])
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

  setAnchorState(mountedState) {
    const oldIds = Object.keys(this._mountedAnchorRects)
    const removedIds = _.difference(oldIds, Object.keys(mountedState))

    for (const id of removedIds) {
      delete this._mountedAnchorRects[id]
    }

    this._mountedAnchorRects = mountedState;

    this.trigger();
  }
}
const store = new OverlaidComponentStore();
export default store
