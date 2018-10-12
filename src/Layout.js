import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HexUtils from './HexUtils';
import Orientation from './models/Orientation';
import Point from './models/Point';
import Hexagon from './Hexagon/Hexagon';
import Path from './Path';
import { ViewBoxConsumer } from './HexGrid';

export const LAYOUT_FLAT = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0),2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
export const LAYOUT_POINTY = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);

class Layout extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    flat: PropTypes.bool,
    origin: PropTypes.object,
    size: PropTypes.object,
    spacing: PropTypes.number
  };

  static defaultProps = {
    size: new Point(10, 10),
    flat: true,
    spacing: 1.0,
    origin: new Point(0, 0)
  }

  getPointOffset(corner, orientation, size) {
    let angle = 2.0 * Math.PI * (corner + orientation.startAngle) / 6;
    return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
  }

  // TODO Refactor
  calculateCoordinates(orientation) {
    const corners = [];
    const center = new Point(0, 0);
    const { size } = this.props;

    Array.from(new Array(6), (x, i) => {
      const offset = this.getPointOffset(i, orientation, size);
      const point = new Point(center.x + offset.x, center.y + offset.y);
      corners.push(point);
    });

    return corners;
  }

  render() {
    const { children, flat, className, viewBox, ...rest } = this.props;
    const orientation = (flat) ? LAYOUT_FLAT : LAYOUT_POINTY;
    const cornerCoords = this.calculateCoordinates(orientation);
    const points = cornerCoords.map(point => `${point.x},${point.y}`).join(' ');
    const layout = {...rest, orientation};
    const { x: x_, y: y_, width: width_, height: height_ } = viewBox;
    const x = x_ - 2 * rest.size.x;
    const y = x_ - 2 * rest.size.y;
    const width = width_ + 2 * rest.size.x;
    const height = height_ + 2 * rest.size.y;
    const inBounds = React.Children.toArray(children).filter(child => {
      if (child.type === Hexagon) {
        const point = HexUtils.hexToPixel(child.props, layout);
        const corners = cornerCoords.map(coord => new Point(coord.x + point.x, coord.y + point.y));
        const filtered = corners.filter(corner => corner.x > x && corner.x < width && corner.y > y && corner.y < height);
        return filtered.length > 0;
      }
      return true;
    });
    return (
      <LayoutProvider value={{ layout, points }}>
        <g className={className}>
          {inBounds}
        </g>
      </LayoutProvider>
    );
  }
}

export const LayoutContext = React.createContext({
  layout: LAYOUT_FLAT,
  points: ""
})
export const { Provider: LayoutProvider, Consumer: LayoutConsumer } = LayoutContext;

export default props => <ViewBoxConsumer>{viewBox => <Layout {...props} viewBox={viewBox} />}</ViewBoxConsumer>;
