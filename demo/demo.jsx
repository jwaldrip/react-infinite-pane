import 'whatwg-fetch';

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import InfinitePane from '../src';

class LoadedImage extends React.Component {
  render() {
    return <img className="demo-img" {...this.props} />;
  }
}

const startingWidth = 200;

class DemoPage extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      imageCount: 0,
      imageWidth: startingWidth,
      imageHeight: Math.round(startingWidth * (3 / 4)),
      imageList: [],
    };
  }

  get imageList() {
    const { imageList, imageWidth, imageHeight } = this.state;
    return imageList.map(i => `/img/${imageWidth}/${imageHeight}/${i.id}`);
  }

  get imageUrls() {
    const { imageList } = this;
    return _.times(this.state.imageCount, i => ({ src: imageList[i % imageList.length] }));
  }

  componentDidMount() {
    fetch('https://unsplash.it/list').then(r => r.json()).then(json => {
      this.setState({ imageCount: json.length, imageList: json });
    });
  }

  handleImageCountChange = ({ target: input }) => {
    this.setState({ imageCount: input.value });
  }

  handleImageWidthChange = ({ target: input }) => {
    this.setState({ imageWidth: input.value });
  }

  handleImageHeightChange = ({ target: input }) => {
    this.setState({ imageHeight: input.value });
  }

  renderSettings() {
    const { imageCount, imageHeight, imageWidth } = this.state;
    const style = {
      left: 0,
      bottom: 0,
      opacity: 0.9,
      position: 'fixed',
      width: '100%',
      backgroundColor: 'white',
      padding: 10,
      borderTop: '1px grey solid'
    };
    return (
      <div style={style}>
        <div style={{ float: 'left' }}>
          <label for="imageCount">Number of Images to Load:</label>&nbsp;
          <input name="imageCount" type="number" value={imageCount} min="0" max="1000000" onChange={this.handleImageCountChange} />&nbsp;
          <label for="imageWidth">Image Width:</label>&nbsp;
          <input name="imageWidth" type="number" value={imageWidth} min="10" max="1000" onChange={this.handleImageWidthChange} />&nbsp;
          <label for="imageHeight">Image Height:</label>&nbsp;
          <input name="imageHeight" type="number" value={imageHeight} min="10" max="1000" onChange={this.handleImageHeightChange} />
        </div>
        <div style={{ float: 'right', marginRight: 20 }}>
          <a href="https://www.npmjs.com/package/react-infinite-pane">
            <img src="https://img.shields.io/npm/v/react-infinite-pane.svg" />
          </a>
          &nbsp;
          <a href="https://github.com/jwaldrip/react-infinite-pane">
            <img src="https://img.shields.io/badge/github-jwaldrip%2Freact--infinite--pane-blue.svg" />
          </a>
        </div>
      </div>
    );
  }

  render() {
    const { imageCount, imageHeight, imageWidth } = this.state;
    return (
      <div>
        {this.renderSettings()}
        <InfinitePane
          Component={LoadedImage}
          componentProps={{ width: imageWidth, height: imageHeight }}
          list={this.imageUrls}
          totalCount={imageCount}
          id="demo"
        />
      </div>
    );
  }

}

ReactDOM.render(<DemoPage />, document.getElementById('root'));
