import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vSelect from 'vue-select'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'

import {
  BBadge,
  BButton,
  BCard, BCardBody, BCardFooter, BCardHeader, BCardText,
  BCol, BContainer, BRow,
  BFormGroup, BFormInput, BFormRadio, BFormRadioGroup,
  BInputGroup, BInputGroupAppend,
  BLink,
  BListGroup, BListGroupItem,
  BNav, BNavbar, BNavbarBrand, BNavItem,
  BPagination,
  BSpinner,
  BTab, BTable, BTabs,
  BToast,
  VBTooltip
} from 'bootstrap-vue'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

// Register only the bootstrap-vue components actually used in templates.
// Adding a new <b-*> tag requires adding it to this list.
const bootstrapVueComponents = {
  BBadge,
  BButton,
  BCard, BCardBody, BCardFooter, BCardHeader, BCardText,
  BCol, BContainer, BRow,
  BFormGroup, BFormInput, BFormRadio, BFormRadioGroup,
  BInputGroup, BInputGroupAppend,
  BLink,
  BListGroup, BListGroupItem,
  BNav, BNavbar, BNavbarBrand, BNavItem,
  BPagination,
  BSpinner,
  BTab, BTable, BTabs,
  BToast
}
for (const [name, component] of Object.entries(bootstrapVueComponents)) {
  Vue.component(name, component)
}
Vue.directive('b-tooltip', VBTooltip)
Vue.component('v-select', vSelect)

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