const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === "production" ? './' : "/",
  transpileDependencies: true,
  lintOnSave: false, //关闭eslint校验
  css: {
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
