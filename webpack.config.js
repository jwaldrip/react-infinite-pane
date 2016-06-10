const path = require('path');

module.exports = {
  context: __dirname,
  cache: false,
  entry: [
    'babel-polyfill',
    './demo/demo.jsx'
  ],
  devtool: 'source-map',
  output: {
    publicPath: '/',
    path: path.join(__dirname, './public/assets'),
    filename: 'demo.js',
  },
  resolve: {
    extensions: [ '', '.js', '.jsx', '.es6' ]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
      }
    ]
  }
};
