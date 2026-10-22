const { defineConfig } = require('@vue/cli-service')
const path = require('path');  
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {  
    resolve: {  
      alias: {  
        '@': path.resolve(__dirname, './'),
      },
    },
    module: {
      rules: [
        // GeoJSON files are served as static files (require() gives their URL), not bundled in the JS
        { test: /\.geojson$/, type: 'asset/resource' },
        // SLD styles: require() gives the XML content
        { test: /\.sld$/, type: 'asset/source' },
      ],
    },
  }
})
