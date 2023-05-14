const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      // rules for loading different file types, such as JavaScript, CSS, images, etc.
    ]
  },
  plugins: [
    // plugins for optimizing and transforming the bundled code
  ],
  devtool: 'source-map'
};
