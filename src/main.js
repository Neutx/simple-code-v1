import Vue from 'vue'
import App from './App.vue'

import ElementUI from 'element-ui'
import './assets/style/element-variables.scss'
import '@/assets/style/global.scss'

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
  render: h => h(App),

  beforeCreate() {
    Vue.prototype.$bus = this; //安装全局总线
  }
}).$mount('#app')
