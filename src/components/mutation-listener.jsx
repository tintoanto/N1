import React from 'react';
import ReactDOM from 'react-dom';

export default class MutationListener extends React.Component {
  static displayName = "MutationListener";

  static propTypes = {
    onMutate: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.observer = null;
  }

  componentDidMount() {
    const itemNode = ReactDOM.findDOMNode(this);

    const onMutate = () => {
      const rect = itemNode.getBoundingClientRect();
      this.props.onMutate({rect})
    }

    // We need to use a mutation observer because it's possible for the
    // component to change its height without ever making a state
    // change. Furthermore if a sub component makes a state change, the
    // parent-level componentDidUpdate won't fire anyway.
    this.observer = new MutationObserver(onMutate)
    this.observer.observe(itemNode, MUTATION_CONFIG)
  }

  componentWillUnmount() {
    this.observer.disconnect()
  }

  render() {
    return (
      <div className="mutation-listener-wrap">
        {this.props.children}
      </div>
    )
  }
};
