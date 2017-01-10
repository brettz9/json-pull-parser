const webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'dist/json-pull-parser.js',
    library: 'JSONPullParser',
    libraryTarget: 'umd',
  },
  devtool: "source-map",
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    }),
  ],
};