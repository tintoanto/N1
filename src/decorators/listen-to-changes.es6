import React from 'react';
import ReactDOM from 'react-dom';

const MUTATION_CONFIG = {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
  attributeOldValue: true,
  characterDataOldValue: true,
}

function ListenToChanges(ComposedComponent) {
  return class extends React.Component {
    static displayName = ComposedComponent.displayName;

    static propTypes = {
      onMutated: React.PropTypes.func,
      onWillUnmount: React.PropTypes.func,
    }

    constructor(props) {
      super(props);
      this.observer = null;
    }

    componentDidMount() {
      const itemNode = ReactDOM.findDOMNode(this);

      const onMutated = () => {
        const rect = itemNode.getBoundingClientRect();
        this.props.onMutated({rect})
      }

      // We need to use a mutation observer because it's possible for the
      // component to change its height without ever making a state
      // change. Furthermore if a sub component makes a state change, the
      // parent-level componentDidUpdate won't fire anyway.
      this.observer = new MutationObserver(onMutated)
      this.observer.observe(itemNode, MUTATION_CONFIG)
      onMutated()
    }

    componentWillUnmount() {
      this.observer.disconnect()
    }

    // Usually a decorator should not add an extra element and simply
    // render its subject. However, since we're attaching a mutation
    // listener we need a node that we guarantee won't change from
    // underneath us. The `ComposedComponent` may swap out nodes depending
    // on its state.
    render() {
      return (
        <div className="listen-to-changes-wrap">
          <ComposedComponent {...this.props} />
        </div>
      )
    }
  };
}
export default ListenToChanges
