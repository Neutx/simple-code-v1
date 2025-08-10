const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Kontrol'
    }
  },
  publicPath: '/',
  transpileDependencies: true,
  lintOnSave: false, 
  productionSourceMap: false, // Disable source maps in production for security
  css: {
    extract: true, // Extract CSS into separate files
    loaderOptions: {
      sass: {
        // Suppress deprecation warnings from Element UI
        sassOptions: {
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div']
        }
      },
      scss: {
        // Suppress deprecation warnings from Element UI
        sassOptions: {
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div']
        }
      }
    }
  }
})
