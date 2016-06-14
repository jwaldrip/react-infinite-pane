const express = require('express');
const webpack = require('webpack');
const path = require('path');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config');
const url = require('url');
const https = require('https');

const app = express();

app.use(webpackMiddleware(webpack(webpackConfig)));
app.get('/img/:width/:height/:id', (req, res) => {
  req.setEncoding('binary');
  const { width, height, id } = req.params;
  const imgUrl = url.parse(`https://unsplash.it/${width}/${height}/?image=${id}`);
  https.get(imgUrl, imgRes => {
    const { headers, statusCode } = imgRes;
    headers['cache-control'] = 'public, max-age=86400';
    Object.keys(headers).forEach(key => res.header(key, headers[key]));
    res.status(statusCode);
    imgRes.on('data', d => {
      try {
        res.send(d);
      } catch (e) {
        // Do nothing...
      }
    });
    imgRes.on('end', () => res.end() );
  });
});
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './demo/index.html'));
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App is now running on http://localhost:${port}`); // eslint-disable-line no-console
});
