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

  filterChildren(children, cornerCoords, viewBox, layout) {
    const { x, y, width, height } = viewBox;
    return React.Children.toArray(children).filter(child => {
      if (!child.props) {
        return true;
      }
      if (child.type === Hexagon || (child.props.q !== undefined && child.props.r !== undefined && child.props.s !== undefined)) {
        const point = HexUtils.hexToPixel(child.props, layout);
        const corners = cornerCoords.map(coord => new Point(coord.x + point.x, coord.y + point.y));
        const filtered = corners.filter(corner => corner.x > x && corner.x < width && corner.y > y && corner.y < height);
        if (filtered.length) {
          console.log(HexUtils.hexToPixel(child.props, layout));
        }
        return filtered.length;
      }
      return true;
    });
  }

  render() {
    const { children = [], flat, className, viewBox, ...rest } = this.props;
    const orientation = (flat) ? LAYOUT_FLAT : LAYOUT_POINTY;
    const cornerCoords = this.calculateCoordinates(orientation);
    const points = cornerCoords.map(point => `${point.x},${point.y}`).join(' ');
    const layout = {...rest, orientation};
    const inBounds = this.filterChildren(children, cornerCoords, viewBox, layout);
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
