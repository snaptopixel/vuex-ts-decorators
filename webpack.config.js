module.exports = {
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }]
  }
}