import { times, isEqual } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import filterReactDomProps from 'filter-react-dom-props';

const nullNode = document.createElement('div');

export default class InfinitePane extends React.Component {

  static propTypes = {
    // The component to render for each item in the list.
    Component: React.PropTypes.func.isRequired,
    // The total number of items in the list.
    totalCount: React.PropTypes.number.isRequired,
    // The list of object properties to be passed to the component.
    list: React.PropTypes.array.isRequired,
    // The static props to pass to the underlying component.
    componentProps: React.PropTypes.object,
    // The function to fetch additional items.
    fetch: React.PropTypes.func,
    // The number of rows to buffer above and below the fold.
    bufferRows: React.PropTypes.number
  };

  static defaultProps = {
    componentProps: {},
    bufferRows: 5
  };

  static initialState = {
    // The starting row.
    startRow: 0,
    // The visible rows.
    visibleRows: 1,
    // The number of items per row.
    itemsPerRow: 1,
    // The row height.
    rowHeight: 0
  };

  constructor(...args) {
    super(...args);
    this.state = InfinitePane.initialState;
  }

  // getter, calculate the left margin of each item
  get calculatedItemMarginLeft() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginLeft, 10) : 0;
  }

  // getter, calculate the top margin of each item
  get calculatedItemMarginTop() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginTop, 10) : 0;
  }

  // getter, calculate the right margin of each item
  get calculatedItemMarginRight() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginRight, 10) : 0;
  }

  // getter, calculate the bottom margin of each item
  get calculatedItemMarginBottom() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginBottom, 10) : 0;
  }

  // getter, calculate the item height
  get calculatedItemHeight() {
    const firstNode = this.findFirstNode();
    const { calculatedItemMarginTop, calculatedItemMarginBottom } = this;
    const height = firstNode ?
      parseInt(getComputedStyle(firstNode).height, 10) : 0;
    return calculatedItemMarginTop + height + calculatedItemMarginBottom;
  }

  // getter, calculate the item height
  get calculatedItemWidth() {
    const firstNode = this.findFirstNode();
    const { calculatedItemMarginLeft, calculatedItemMarginRight } = this;
    const width = firstNode ?
      parseInt(getComputedStyle(firstNode).width, 10) : 0;
    return calculatedItemMarginLeft + width + calculatedItemMarginRight;
  }

  // getter, calculate the items per row
  get calculatedItemsPerRow() {
    const containerWidth = this.findContainerNode().offsetWidth;
    const itemWidth = this.calculatedItemWidth;
    if (itemWidth === 0 || containerWidth === 0) {
      return 1;
    }
    return Math.floor(containerWidth / itemWidth);
  }

  // getter, calculate the start row
  get calculatedStartRow() {
    const { bufferRows } = this.props;
    const containerTop = this.findContainerNode().getBoundingClientRect().top;
    if (this.calculatedItemHeight === 0 || containerTop > 0) {
      return 0;
    }
    const calculatedRow = Math.floor(-containerTop / this.calculatedItemHeight);
    const rowAboveZero = Math.max(calculatedRow - bufferRows, 0);
    const maxPossibleRow = Math.abs(this.totalRowCount - 1);
    return Math.min(maxPossibleRow, rowAboveZero);
  }

  // getter, calculate the visible rows
  get calculatedVisibleRows() {
    const { bufferRows } = this.props;
    const containerTop = this.findContainerNode().getBoundingClientRect().top;
    const containerBottom = this.findContainerNode().getBoundingClientRect().bottom;
    if (this.calculatedItemHeight === 0 || containerBottom < 0) {
      return 1;
    }
    const top = Math.max(0, containerTop);
    const bottom = Math.min(window.innerHeight, containerBottom);
    return Math.max(Math.ceil((bottom - top) / this.calculatedItemHeight) + 1, 1) + bufferRows;
  }

  // getter, the end index
  get endIndex() {
    const { totalCount } = this.props;
    const { startRow, visibleRows, itemsPerRow } = this.state;
    const endIndex = (startRow + visibleRows) * itemsPerRow;
    return [ endIndex, totalCount ].sort((a, b) => a > b)[0];
  }

  // getter, the start index
  get startIndex() {
    const { startRow, itemsPerRow } = this.state;
    return startRow * itemsPerRow;
  }

  // getter, the total row count
  get totalRowCount() {
    return Math.ceil(this.props.totalCount / this.state.itemsPerRow);
  }

  // getter, the buffered full list
  get fullList() {
    return times(this.props.totalCount, index => this.props.list[index]);
  }

  // track window resize
  trackResize = () => {
    clearTimeout(this.resize);
    this.resize = setTimeout(this.calculatePositions.bind(this), 10);
  };

  // track window scroll
  trackScroll = () => {
    clearTimeout(this.scroll);
    this.scroll = setTimeout(this.calculatePositions.bind(this), 10);
  };

  // find all of the visible nodes by their ref
  findNodes() {
    const { startIndex, endIndex } = this;
    return this.fullList.slice(startIndex, endIndex).map(
      (item, index) => {
        index += startIndex;
        const ref = `item_${index}`;
        return ReactDOM.findDOMNode(this.refs[ref]);
      }
    ).filter(Boolean);
  }

  // find the last node in the visible list
  findLastNode() {
    return this.findNodes().reverse()[0];
  }

  // find the first node in the visible list
  findFirstNode() {
    return this.findNodes()[0];
  }

  // find the top buffer node
  findTopBufferNode() {
    return ReactDOM.findDOMNode(this.refs.topBuffer) || nullNode;
  }

  // find the bottom buffer node
  findBottomBufferNode() {
    return ReactDOM.findDOMNode(this.refs.bottomBuffer) || nullNode;
  }

  // find the main container node
  findContainerNode() {
    return ReactDOM.findDOMNode(this.refs.infiniteContainer) || nullNode;
  }

  // determine if the component should update
  shouldComponentUpdate(nextProps, nextState) {
    return !(
      isEqual(this.props, nextProps) && isEqual(this.state, nextState)
    );
  }

  // calculate the positions of the nodes
  calculatePositions() {
    let {
      calculatedStartRow,
      calculatedItemHeight,
      calculatedVisibleRows,
      calculatedItemsPerRow,
      endIndex,
      startIndex
    } = this;

    // Fetch more if needed
    const allowFetch = () => { this.fetching = false; };
    const { fetch: fetchMore, list, totalCount } = this.props;
    if (endIndex >= list.length && list.length < totalCount && !this.fetching) {
      this.fetching = true;
      fetchMore({ startIndex, endIndex }).then(allowFetch).catch(console.error); // eslint-disable-line no-console
    }

    this.setState({
      startRow: calculatedStartRow,
      visibleRows: calculatedVisibleRows,
      rowHeight: calculatedItemHeight,
      itemsPerRow: calculatedItemsPerRow,
    });
  }

  // component life cycle before mount
  componentWillMount() {
    window.addEventListener('resize', this.trackResize);
    window.addEventListener('scroll', this.trackScroll);
  }

  // component life cycle before unmount
  componentWillUnmount() {
    clearTimeout(this.resize);
    clearTimeout(this.scroll);
    window.removeEventListener('resize', this.trackResize);
    window.removeEventListener('scroll', this.trackScroll);
  }

  // component life cycle on mount
  componentDidMount() {
    this.calculatePositions();
  }

  // component life cycle on update
  componentDidUpdate() {
    this.calculatePositions();
  }

  // render the top buffer
  renderTopBuffer() {
    const { startRow, rowHeight } = this.state;
    const height = startRow * rowHeight || 0;
    return <div ref="topBuffer" style={{ height, clear: 'both' }} />;
  }

  // render the visible items
  renderVisibleItems() {
    const { startIndex, endIndex } = this;
    let { Component, getKey } = this.props;
    if (!getKey) {
      getKey = item => item.id;
    }
    return this.fullList.slice(startIndex, endIndex).map((item, index) => {
      let loaded = true;
      index += startIndex;
      if (item === undefined) {
        item = this.fullList[0];
        loaded = false;
      }
      const ref = `item_${index}`;
      const component = <Component loaded={loaded} key={index} ref={ref} {...item} {...this.props.componentProps} />;
      return component;
    });
  }

  // render the bottom buffer
  renderBottomBuffer() {
    const { startRow, visibleRows, rowHeight } = this.state;
    const { totalRowCount } = this;
    const endRow = visibleRows + startRow;
    const height = endRow > totalRowCount ? 0 : (totalRowCount - endRow) * rowHeight || 0;
    return <div ref="bottomBuffer" style={{ height, clear: 'both' }} />;
  }

  // render the component
  render() {
    return (
      <div ref="infiniteContainer" {...filterReactDomProps(this.props)}>
        {this.renderTopBuffer()}
        {this.renderVisibleItems()}
        {this.renderBottomBuffer()}
      </div>
    );
  }
}
