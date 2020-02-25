const path = require("path");

module.exports = {
  entry: "./handler.ts",
  target: "node",
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx", ""]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "handler.js"
  }
};
