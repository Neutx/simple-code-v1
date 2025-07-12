import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import device from './modules/device'
import settings from './modules/settings'
import macros from './modules/macros'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    device,
    settings,
    macros
  },
  strict: process.env.NODE_ENV !== 'production'
}) 