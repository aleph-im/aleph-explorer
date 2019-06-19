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
      path: '/message/:hash',
      name: 'message',
      component: () => import(/* webpackChunkName: "message" */ './views/Message.vue'),
      props: true
    },
    {
      path: '/address/:address',
      name: 'address-detail',
      component: () => import(/* webpackChunkName: "address_detail" */ './views/AddressDetail.vue'),
      props: true
    }
  ]
})
