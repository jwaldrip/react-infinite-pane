import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import InfinitePane from '../src';

class LoadedImage extends React.Component {
  render() {
    const style = { margin: 5, border: '1px solid grey' };
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
    return imageList.map(i => `https://unsplash.it/${imageWidth}/${imageHeight}/?image=${i.id}`);
  }

  get imageUrls() {
    const { imageHeight, imageWidth } = this.state;
    const { imageList } = this;
    return _.times(this.state.imageCount, i => ({ src: imageList[i % imageList.length], height: imageHeight, width: imageWidth }));
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

  render() {
    const { imageCount, imageHeight, imageWidth } = this.state;
    return (
      <div>
        <label for="imageCount">Number of Images to Load:</label>&nbsp;
        <input name="imageCount" type="number" value={imageCount} onChange={this.handleImageCountChange} />&nbsp;
        <label for="imageWidth">Image Width:</label>&nbsp;
        <input name="imageWidth" type="number" value={imageWidth} onChange={this.handleImageWidthChange} />&nbsp;
        <label for="imageHeight">Image Height:</label>&nbsp;
        <input name="imageHeight" type="number" value={imageHeight} onChange={this.handleImageHeightChange} />&nbsp;
        <InfinitePane
          Component={LoadedImage}
          list={this.imageUrls}
          totalCount={imageCount}
        />
      </div>
    );
  }

}

ReactDOM.render(<DemoPage />, document.getElementById('root'));
