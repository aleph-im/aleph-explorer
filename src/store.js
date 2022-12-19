import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    api_server: 'api2.aleph.im',
    network_id: 261,
    ipfs_gateway: 'https://ipfs.io/ipfs/',
    account: null,
    profiles: {},
    addresses_stats: [],
    last_broadcast: null,
    categories: [ // categories are hard-coded for now...
      'Crypto',
      'Aleph',
      'Tech',
      'Design',
      'Random'
    ]
  },
  mutations: {
    set_addresses_stats (state, addresses_stats) {
      try {
        delete addresses_stats[null]
      } catch (error) {
        console.log('Cannot delete null key')
      }
      state.addresses_stats = addresses_stats
    },
    set_account (state, account) {
      state.account = account
    },
    store_profile (state, payload) {
      state.profiles[payload.address] = payload.profile
    },
    set_network (state, payload) {
      state.network_id = payload.network_id
      state.api_server = payload.api_server
      state.profiles = {}
      state.address_alias = {}
      state.alias_address = {}
      state.last_broadcast = null
    }
  },
  actions: {

  }
})
