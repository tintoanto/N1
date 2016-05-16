import {Utils} from 'nylas-exports'
import {buildAnchorTag} from './anchor-helpers'

class OverlaidComponentRegistry {
  constructor() {
    this._overlaidElements = {};
  }

  getOverlaidElement(id) {
    return this._overlaidElements[id]
  }

  registerOverlaidElement(val) {
    const id = Utils.generateTempId();
    this._overlaidElements[id] = val;
    return id
  }

  buildAnchorTag(id, props = {}) {
    return buildAnchorTag(id, props)
  }
}
const registry = new OverlaidComponentRegistry();
export default registry
