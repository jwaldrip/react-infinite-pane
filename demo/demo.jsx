import 'whatwg-fetch';

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import InfinitePane from '../src';

const placeholderImg = 'data:image/png;base64,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';

class LoadedImage extends React.Component {
  render() {
    const style = { margin: 5, border: '1px solid grey', background: `center center url(${placeholderImg}) no-repeat` };
    return <img {...this.props} style={style} />;
  }
}

class DemoPage extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      imageCount: 0,
      imageWidth: 300,
      imageHeight: 200,
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
          <input name="imageCount" type="number" value={imageCount} onChange={this.handleImageCountChange} />&nbsp;
          <label for="imageWidth">Image Width:</label>&nbsp;
          <input name="imageWidth" type="number" value={imageWidth} onChange={this.handleImageWidthChange} />&nbsp;
          <label for="imageHeight">Image Height:</label>&nbsp;
          <input name="imageHeight" type="number" value={imageHeight} onChange={this.handleImageHeightChange} />&nbsp;
        </div>
        <div style={{ float: 'right', marginRight: 20 }}>
          <strong>react-infinite-pane</strong>
          &nbsp;::
          built by <a href="https://github.com/jwaldrip">Jason Waldrip</a>
          &nbsp;::&nbsp;
          <a href="https://github.com/jwaldrip/react-infinite-pane">view it on github</a>
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
        />
      </div>
    );
  }

}

ReactDOM.render(<DemoPage />, document.getElementById('root'));
