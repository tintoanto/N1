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
    this._anchorRects = {}
    this._overlayRects = {}
    this.observeOverlays = new MutationObserver(this._onOverlaysMutated)
    this.observeAnchors = new MutationObserver(this._onAnchorsMutated)
  }

  componentDidMount() {
    this.observeOverlays.observe(
      ReactDOM.findDOMNode(this.refs.overlaidComponents),
      MUTATION_CONFIG
    )
    this.observeAnchors.observe(
      ReactDOM.findDOMNode(this.refs.anchorContainer),
      MUTATION_CONFIG
    )
    // this.unsub = OverlaidComponentRegistry.listen(this._onAnchorsChange)
  }

  componentWillUnmount() {
    this.observer.disconnect()
    this.unsub()
  }

  _onOverlaysMutated = () => {
    this._setRects({
      root: this.refs.overlaidComponents,
      selector: `.${OverlaidComponents.WRAP_CLASS}`,
      rectRegistry: this._overlayRects,
    })
  }

  _onAnchorsMutated = () => {
    this._setRects({
      root: this.refs.anchorContainer,
      selector: `.${ANCHOR_CLASS}`,
      rectRegistry: this._anchorRects,
    })
  }

  _setRects({root, selector, rectRegistry}) {
    const nodes = Array.from(root.querySelectorAll(selector));
    if (nodes.length === 0) { return }
    for (const node of nodes) {
      const id = node.dataset.overlayId;
      rectRegistry[id] = node.getBoundingClientRect();
    }
  }

  // _onAnchorsChange = () => {
  //   const anchorRects = OverlaidComponentRegistry.getAnchorRects();
  //   if (!_.isEqual(anchorRects, this.state.anchorRects)) {
  //     this.setState({anchorRects})
  //   }
  // }

  _renderOverlaidComponents() {
    const els = [];
    for (const id of Object.keys(this.state.anchorRects)) {
      const rect = this.state.anchorRects[id];
      if (!rect) { throw new Error("No mounted rect for #{id}") }

      const style = {left: rect.left, top: rect.top, position: "relative"}
      const data = OverlaidComponentRegistry.getOverlaidComponent(id)

      if (!data) { throw new Error("No registered component for #{id}") }
      const {component, props} = data

      const el = React.createElement(component, Object.assign({ key: id }, props))

      const wrap = (
        <div className={OverlaidComponents.WRAP_CLASS} style={style} data-overlay-id={id}>
          {el}
        </div>
      )

      els.push(wrap)
    }
    const padding = {
      paddingLeft: this.props.padding,
      paddingRight: this.props.padding,
      paddingTop: 0,
      paddingBottom: 0,
    }
    return (
      <div style={padding} ref="overlaidComponents" className="overlaid-components">
        {els}
      </div>
    )
  }

  render() {
    return (
      <div>
        <div className="anchor-container" ref="anchorContainer">
          this.props.children
        </div>
        this._renderOverlaidComponents()
      </div>
    )
  }
}
