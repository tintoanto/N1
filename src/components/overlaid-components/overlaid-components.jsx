import _ from 'underscore'
import React from 'react'
import ReactDOM from 'react-dom'
import OverlaidComponentRegistry from './overlaid-component-registry'
import {ANCHOR_CLASS} from './anchor-helpers'

const MUTATION_CONFIG = {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
}

export default class OverlaidComponents extends React.Component {
  static displayName = "OverlaidComponents";

  static propTypes = {
    children: React.PropTypes.node,
  }

  static WRAP_CLASS = "n1-overlaid-component-wrap";

  constructor(props) {
    super(props);
    this.state = {
      anchorRectIds: [],
    }
    this._anchorRects = {}
    this._overlayRects = {}
    this.observeOverlays = new MutationObserver(this._updateAnchors)
    this.observeAnchors = new MutationObserver(this._updateOverlays)
  }

  componentDidMount() {
    this._updateAnchors();
    this._updateOverlays();
    this._setupMutationObservers()
  }

  componentWillUpdate() {
    this._teardownMutationObservers()
  }

  componentDidUpdate() {
    this._updateAnchors();
    this._updateOverlays();
    this._setupMutationObservers();
  }

  componentWillUnmount() {
    this._teardownMutationObservers()
  }

  _setupMutationObservers() {
    this.observeOverlays.disconnect()
    this.observeOverlays.observe(
      ReactDOM.findDOMNode(this.refs.overlaidComponents),
      MUTATION_CONFIG
    )
    this.observeAnchors.disconnect()
    this.observeAnchors.observe(
      ReactDOM.findDOMNode(this.refs.anchorContainer),
      MUTATION_CONFIG
    )
  }

  _teardownMutationObservers() {
    this.observeOverlays.disconnect()
    this.observeAnchors.disconnect()
  }

  _updateAnchors = () => {
    this._teardownMutationObservers();
    const lastRects = _.clone(this._overlayRects);
    this._overlayRects = this._calculateRects({
      root: this.refs.overlaidComponents,
      selector: `.${OverlaidComponents.WRAP_CLASS}`,
    })
    if (_.isEqual(lastRects, this._overlayRects)) { return }
    this._adjustNodes("anchorContainer", this._overlayRects, ["width", "height"]);
    this._setupMutationObservers()
  }

  _updateOverlays = () => {
    this._teardownMutationObservers();
    const lastRects = _.clone(this._anchorRects)
    this._anchorRects = this._calculateRects({
      root: this.refs.anchorContainer,
      selector: `.${ANCHOR_CLASS}`,
    })
    if (_.isEqual(lastRects, this._anchorRects)) { return }
    this._adjustNodes("overlaidComponents", this._anchorRects, ["top", "left"]);
    this._setupMutationObservers();
    if (!_.isEqual(this.state.anchorRectIds, Object.keys(this._anchorRects))) {
      this.setState({anchorRectIds: Object.keys(this._anchorRects)})
    }
  }

  _adjustNodes(ref, rects, dims) {
    const root = ReactDOM.findDOMNode(this.refs[ref]);
    for (const id of Object.keys(rects)) {
      const node = root.querySelector(`[data-overlay-id=${id}]`);
      if (!node) { continue }
      for (const dim of dims) {
        const dimVal = rects[id][dim];
        node.style[dim] = `${dimVal}px`
      }
    }
  }

  _calculateRects({root, selector}) {
    const updatedRegistry = {}
    const nodes = Array.from(root.querySelectorAll(selector));
    if (nodes.length === 0) { return updatedRegistry }
    const rootRect = root.getBoundingClientRect();
    for (const node of nodes) {
      const id = node.dataset.overlayId;
      const rawRect = node.getBoundingClientRect();
      const adjustedRect = {
        left: rawRect.left - rootRect.left,
        top: rawRect.top - rootRect.top,
        width: rawRect.width,
        height: rawRect.height,
      }
      updatedRegistry[id] = adjustedRect;
    }
    return updatedRegistry
  }

  _renderOverlaidComponents() {
    const els = [];
    for (const id of this.state.anchorRectIds) {
      const rect = this._anchorRects[id];
      if (!rect) { throw new Error("No mounted rect for #{id}") }

      const style = {left: rect.left, top: rect.top, position: "relative"}
      const element = OverlaidComponentRegistry.getOverlaidElement(id)

      if (!element) { throw new Error("No registered element for #{id}") }

      const wrap = (
        <div
          className={OverlaidComponents.WRAP_CLASS}
          style={style}
          data-overlay-id={id}
        >
          {element}
        </div>
      )

      els.push(wrap)
    }
    return (
      <div ref="overlaidComponents" className="overlaid-components">
        {els}
      </div>
    )
  }

  render() {
    return (
      <div className="overlaid-components-wrap" style={{position: "relative"}}>
        <div className="anchor-container" ref="anchorContainer">
          {this.props.children}
        </div>
        {this._renderOverlaidComponents()}
      </div>
    )
  }
}
