const express = require('express');
const webpack = require('webpack');
const path = require('path');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config');

const app = express();

app.use(webpackMiddleware(webpack(webpackConfig)));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './demo/index.html'));
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App is now running on http://localhost:${port}`); // eslint-disable-line no-console
});
