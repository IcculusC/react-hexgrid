import React, { Component } from 'react';
import PropTypes from 'prop-types';

class HexGrid extends Component {
  static propTypes = {
    width: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired,
    ]),
    height: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.number.isRequired,
    ]),
    viewBox: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.number), PropTypes.string]).isReqiured,
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    width: 800,
    height: 600,
    viewBox: {
      x: -50,
      y: -50,
      width: 100,
      height: 100
    }
  }

  render() {
    const { width, height, viewBox } = this.props
    let viewBox_;
    if (typeof viewBox === "string") {
      const [ x, y, width, height ] = viewBox.split(" ");
      viewBox_ = { x, y, width, height };
    }
    return (
      <svg className="grid" width={width} height={height} viewBox={typeof viewBox === "string" ? viewBox : `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <ViewBoxProvider value={viewBox_ ? viewBox_ : viewBox} >
          {this.props.children}
        </ViewBoxProvider>
      </svg>
    );
  }
}

export const ViewBoxContext = React.createContext({ x: -50, y: -50, width: 100, height: 100 });
export const { Provider: ViewBoxProvider, Consumer: ViewBoxConsumer } = ViewBoxContext;

export default HexGrid;
