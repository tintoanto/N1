import _ from 'underscore'
import React from 'react'
import OverlaidComponentStore from './overlaid-component-store'

export default class OverlaidComponents extends React.Component {
  static displayName = "OverlaidComponents";

  static propTypes = {
    padding: React.PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      anchorRects: OverlaidComponentStore.getAnchorRects(),
    }
  }

  componentDidMount() {
    this.unsub = OverlaidComponentStore.listen(this._onAnchorsChange)
  }

  componentWillUnmount() {
    this.unsub()
  }

  _onAnchorsChange = () => {
    const anchorRects = OverlaidComponentStore.getAnchorRects();
    if (!_.isEqual(anchorRects, this.state.anchorRects)) {
      this.setState({anchorRects})
    }
  }

  render() {
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
    return <div style={padding} className="overlaid-components">{els}</div>
  }
}
