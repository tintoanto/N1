import _ from 'underscore'
import React from 'react'
import ReactDOM from 'react-dom'
import OverlaidComponentStore from './overlaid-component-store'

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

  constructor(props) {
    super(props);
    this.state = {
      anchorRects: {},
    }
    this.observeOverlays = new MutationObserver(this._onOverlaysMutated)
    this.observeChildren = new MutationObserver(this._onChildrenMutated)
  }

  componentDidMount() {
    this.observer.observe(
      ReactDOM.findDOMNode(this.refs.overlaidComponents),
      MUTATION_CONFIG
    )
    this.unsub = OverlaidComponentStore.listen(this._onAnchorsChange)
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {
    this.observer.disconnect()
    this.unsub()
  }

  _onOverlaysMutated = (mutations = []) => {

  }

  _onChildrenMutated = (mutations = []) => {

  }

  _onAnchorsChange = () => {
    const anchorRects = OverlaidComponentStore.getAnchorRects();
    if (!_.isEqual(anchorRects, this.state.anchorRects)) {
      this.setState({anchorRects})
    }
  }

  _renderOverlaidComponents() {
    const els = [];
    for (const id of Object.keys(this.state.anchorRects)) {
      const rect = this.state.anchorRects[id];
      if (!rect) { throw new Error("No mounted rect for #{id}") }

      const style = {left: rect.left, top: rect.top, position: "relative"}
      const data = OverlaidComponentStore.getOverlaidComponent(id)

      if (!data) { throw new Error("No registered component for #{id}") }
      const {component, props} = data

      const el = React.createElement(component, Object.assign({ key: id }, props))

      const wrap = (
        <div className={OverlaidComponentStore.WRAP_CLASS} style={style} data-overlay-id={id}>
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
    return ([
      this.props.children,
      this._renderOverlaidComponents(),
    ])
  }
}
