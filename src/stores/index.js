import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import device from './modules/device'
import settings from './modules/settings'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    device,
    settings
  },
  strict: process.env.NODE_ENV !== 'production'
}) 