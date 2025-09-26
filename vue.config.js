const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // 设置端口号
    port: 8941,
    // 设置主机地址，'0.0.0.0' 表示允许外部访问
    host: '0.0.0.0'
  }
})
