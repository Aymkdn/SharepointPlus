// not used
var path = require('path');
var webpack = require('webpack');
//var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  /*plugins: [
    new BundleAnalyzerPlugin()
  ],*/
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
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /(node_modules|bower_components|\.spec\.js)/,
        use: [
          {
            loader: 'webpack-strip-block'
          }
        ]
      }
    ]
  },
  stats: {
    colors: true
  }
};
