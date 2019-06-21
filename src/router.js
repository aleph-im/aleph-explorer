import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/address/:chain?/:address?/message/:type?/:hash',
      name: 'message-detail',
      component: () => import(/* webpackChunkName: "message_detail" */ './views/MessageDetail.vue'),
      props: true
    },
    {
      path: '/address/:chain?/:address',
      name: 'address-detail',
      component: () => import(/* webpackChunkName: "address_detail" */ './views/AddressDetail.vue'),
      props: true
    },
    {
      path: '/messages/:type?',
      name: 'messages',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "messages" */ './views/Messages.vue')
    },
    {
      path: '/addresses',
      name: 'addresses',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "addresses" */ './views/Addresses.vue')
    }
  ]
})
