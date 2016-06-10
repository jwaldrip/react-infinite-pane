import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

const nullNode = document.createElement('div');

export default class InfinitePane extends React.Component {

  static propTypes = {
    Component: React.PropTypes.func.isRequired,
    componentProps: React.PropTypes.object,
    totalCount: React.PropTypes.number.isRequired,
    list: React.PropTypes.array.isRequired,
    fetch: React.PropTypes.func
  };

  static initialState = {
    startRow: 0,
    visibleRows: 1,
    itemsPerRow: 1,
    rowHeight: 0
  };

  constructor(...args) {
    super(...args);
    this.state = InfinitePane.initialState;
  }

  get calculatedItemMarginLeft() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginLeft, 10) : 0;
  }

  get calculatedItemMarginTop() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginTop, 10) : 0;
  }

  get calculatedItemMarginRight() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginRight, 10) : 0;
  }

  get calculatedItemMarginBottom() {
    const firstNode = this.findFirstNode();
    return firstNode ?
      parseInt(getComputedStyle(firstNode).marginBottom, 10) : 0;
  }

  get calculatedItemHeight() {
    const firstNode = this.findFirstNode();
    const { calculatedItemMarginTop, calculatedItemMarginBottom } = this;
    const height = firstNode ?
      parseInt(getComputedStyle(firstNode).height, 10) : 0;
    return calculatedItemMarginTop + height + calculatedItemMarginBottom;
  }

  get calculatedItemWidth() {
    const firstNode = this.findFirstNode();
    const { calculatedItemMarginLeft, calculatedItemMarginRight } = this;
    const width = firstNode ?
      parseInt(getComputedStyle(firstNode).width, 10) : 0;
    return calculatedItemMarginLeft + width + calculatedItemMarginRight;
  }

  get calculatedItemsPerRow() {
    const containerWidth = this.findContainerNode().offsetWidth;
    const itemWidth = this.calculatedItemWidth;
    if (itemWidth === 0 || containerWidth === 0) {
      return 1;
    }
    return Math.floor(containerWidth / itemWidth);
  }

  get calculatedStartRow() {
    const containerTop = this.findContainerNode().getBoundingClientRect().top;
    if (this.calculatedItemHeight === 0 || containerTop > 0) {
      return 0;
    }
    const calculatedRow = Math.floor(-containerTop / this.calculatedItemHeight);
    const rowAboveZero = Math.max(calculatedRow, 0);
    const maxPossibleRow = Math.abs(this.totalRowCount - 1);
    return Math.min(maxPossibleRow, rowAboveZero);
  }

  get calculatedVisibleRows() {
    const containerTop = this.findContainerNode().getBoundingClientRect().top;
    const containerBottom = this.findContainerNode().getBoundingClientRect().bottom;
    if (this.calculatedItemHeight === 0 || containerBottom < 0) {
      return 1;
    }
    const top = Math.max(0, containerTop);
    const bottom = Math.min(window.innerHeight, containerBottom);
    return Math.max(Math.ceil((bottom - top) / this.calculatedItemHeight) + 1, 1);
  }

  get endIndex() {
    const { totalCount } = this.props;
    const { startRow, visibleRows, itemsPerRow } = this.state;
    const endIndex = (startRow + visibleRows) * itemsPerRow;
    return [ endIndex, totalCount ].sort((a, b) => { return a > b })[0];
  }

  get startIndex() {
    const { startRow, itemsPerRow } = this.state;
    return startRow * itemsPerRow;
  }

  get totalRowCount() {
    return Math.ceil(this.props.totalCount / this.state.itemsPerRow);
  }

  get fullList() {
    return _.times(this.props.totalCount, index => this.props.list[index]);
  }

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

  findLastNode() {
    return this.findNodes().reverse()[0];
  }

  findFirstNode() {
    return this.findNodes()[0];
  }

  findTopBufferNode() {
    return ReactDOM.findDOMNode(this.refs.topBuffer) || nullNode;
  }

  findBottomBufferNode() {
    return ReactDOM.findDOMNode(this.refs.bottomBuffer) || nullNode;
  }

  findContainerNode() {
    return ReactDOM.findDOMNode(this.refs.infiniteContainer) || nullNode;
  }

  renderTopBuffer() {
    const { startRow, rowHeight } = this.state;
    const height = startRow * rowHeight || 0;
    return <div ref="topBuffer" style={{ height, clear: 'both' }} />;
  }

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

  renderBottomBuffer() {
    const { startRow, visibleRows, rowHeight } = this.state;
    const { totalRowCount } = this;
    const endRow = visibleRows + startRow;
    const height = endRow > totalRowCount ? 0 : (totalRowCount - endRow) * rowHeight || 0;
    return <div ref="bottomBuffer" style={{ height, clear: 'both' }} />;
  }

  trackResize = () => {
    let scrollStep = -window.scrollY / (1000 / 15);
    let scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
        this.setState(InfinitePane.initialState);
      }
    }, 15);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    this.setState({ ...InfinitePane.initialState });
  };

  trackScroll = () => {
    clearTimeout(this.scroll);
    this.scroll = setTimeout(this.calculatePositions.bind(this), 10);
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      _.isEqual(this.props, nextProps) && _.isEqual(this.state, nextState)
    );
  }

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

  componentWillMount() {
    window.addEventListener('resize', this.trackResize.bind(this));
    window.addEventListener('scroll', this.trackScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.trackResize.bind(this));
    window.removeEventListener('scroll', this.trackScroll.bind(this));
  }

  componentDidMount() {
    this.calculatePositions();
  }

  componentDidUpdate() {
    this.calculatePositions();
  }

  render() {
    return (
      <div ref="infiniteContainer">
        {this.renderTopBuffer()}
        {this.renderVisibleItems()}
        {this.renderBottomBuffer()}
      </div>
    );
  }
}
