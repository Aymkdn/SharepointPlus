// not used
var path = require('path');
var webpack = require('webpack');

module.exports = {
  target:'web',
  mode:'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'browser'),
    filename: 'sharepointplus.js',
    library: '$SP',
    libraryExport: 'default',
    libraryTarget: 'window',
    futureEmitAssets: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  "useBuiltIns":"usage",
                  "corejs": 3
                }
              ]
            ]
          }
        }
      }
    ]
  },
  stats: {
    colors: true
  }
};
