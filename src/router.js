import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    },
    {
      path: '/address/:chain?/:address?/message/:type?/:hash',
      name: 'message-detail',
      component: () => import('./views/MessageDetail.vue'),
      props: true
    },
    {
      path: '/message/:hash',
      name: 'message-detail',
      component: () => import('./views/MessageDetail.vue'),
      props: true
    },
    {
      path: '/address/:chain?/:address',
      name: 'address-detail',
      component: () => import('./views/AddressDetail.vue'),
      props: true
    },
    {
      path: '/messages/',
      name: 'messages',
      component: () => import('./views/Messages.vue')
    },
    {
      path: '/addresses',
      name: 'addresses',
      component: () => import('./views/Addresses.vue')
    }
  ]
})
