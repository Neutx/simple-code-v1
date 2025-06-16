import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import ElementUI from 'element-ui'
import { Icon } from '@iconify/vue2'

import App from './App.vue'
import router from './router'
import store from './stores'

// Import global styles
import '@/assets/style/global.scss'
import '@/assets/style/element-variables.scss'

// Use plugins
Vue.use(VueCompositionAPI)
Vue.use(ElementUI)

Vue.component('IconifyIcon', Icon)
// Global event bus (keeping for backward compatibility with existing components)
Vue.prototype.$bus = new Vue()

Vue.config.productionTip = false

async function initializeApp() {
  try {
    await store.dispatch('auth/initAuth')
  } catch (error) {
    console.error('Firebase auth initialization failed:', error)
  } finally {
    new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app')
  }
}

// Start the app
initializeApp()
