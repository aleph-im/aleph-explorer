import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import vSelect from 'vue-select'

Vue.component('v-select', vSelect)
Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

console.log(`%c
Welcome to Aleph Explorer
=========================
You are currently connected to ${store.state.api_server.host}, type:
set_api_node('http(s)://xxx.xxx.xxx.xxx:4024') to manually set the API server
`, 'color: #029AFF; font-size: 140%;')

window.set_api_node = url => store.commit('set_api_server', url)