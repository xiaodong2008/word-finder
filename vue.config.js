module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:2946',
        // replace /api
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}