const path = require('path');
const common = require('./webpack.common.js');

module.exports = {
  ...common,
  entry: ['babel-polyfill', './src/admin/index.jsx'],
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: 'bundle.admin.js'
  },
  devServer: {
    historyApiFallback: {
      index: 'admin.html'
    }
  }
};
