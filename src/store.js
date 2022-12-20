import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    network_id: 261,
    ipfs_gateway: 'https://ipfs.io/ipfs/',
    account: null,
    profiles: {},
    addresses_stats: [],
    last_broadcast: null,
    api_server: {
      host: 'api2.aleph.im',
      protocol: 'https:',
      ws_protocol: 'wss:'
    },
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
    },
    set_api_server (state, payload) {
      try {
        const url = new URL(payload)
        state.api_server = {
          host: url.host,
          protocol: url.protocol,
          ws_protocol: url.protocol.match('s') ? 'wss:' : 'ws:'
        }
        console.log(`API server set to ${state.api_server.host}`)
      } catch (error) {
        console.error('Invalid URL format, please prefix with protocol (http(s)://...)')
      }
    }
  },
  actions: {

  }
})