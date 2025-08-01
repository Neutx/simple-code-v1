import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import ElementUI from 'element-ui'
import { Icon } from '@iconify/vue2'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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

// Initialize settings from localStorage on app startup
store.dispatch('settings/loadSettingsFromLocalStorage')

// Wait for Firebase auth to initialize before mounting the app
let app
const auth = getAuth()

onAuthStateChanged(auth, (user) => {
  // Set the user in the store
  if (user) {
    store.commit('auth/SET_USER', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    })
  } else {
    store.commit('auth/SET_USER', null)
    store.commit('auth/SET_USER_PROFILE', null)
  }
  
  // Mark auth as initialized
  store.commit('auth/SET_INITIALIZED', true)
  
  // Mount the app only once after the first auth state change
  if (!app) {
    app = new Vue({
      router,
      store,
      render: h => h(App),
    }).$mount('#app')
  }
})
