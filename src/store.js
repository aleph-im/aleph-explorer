import Vue from 'vue'
import Vuex from 'vuex'
import {fetchAddresses} from "@/helpers";
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    network_id: 261,
    ipfs_gateway: 'https://ipfs.io/ipfs/',
    account: null,
    profiles: {},
    addresses_stats: [],
    addresses_pagination: {
      page: 1,
      per_page: 20,
      total: 0
    },
    address_detail: {
      aggregates: {},
      stats: {},
      messages: [],
      messages_pagination: {
        page: 1,
        per_page: 10,
        total: 0
      },
      posts: [],
      posts_pagination: {
        page: 1,
        per_page: 20,
        total: 0
      }
    },
    api_version: 'v1',
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
      try {
        delete addresses_stats[null]
      } catch (error) {
        console.log('Cannot delete null key')
      }

      // Important: We need to replace the array to trigger reactivity
      state.addresses_stats = { ...addresses_stats }
    },
    set_addresses_pagination (state, pagination) {
      state.addresses_pagination = pagination
    },
    set_api_version (state, version) {
      state.api_version = version
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
    },
    set_address_aggregates (state, aggregates) {
      state.address_detail.aggregates = aggregates || {}
    },
    set_address_stats (state, stats) {
      state.address_detail.stats = stats || {}
    },
    set_address_messages (state, messages) {
      state.address_detail.messages = messages || []
    },
    set_address_messages_pagination (state, pagination) {
      state.address_detail.messages_pagination = pagination
    },
    set_address_posts (state, posts) {
      state.address_detail.posts = posts || []
    },
    set_address_posts_pagination (state, pagination) {
      state.address_detail.posts_pagination = pagination
    }
  },
  actions: {
    async load_addresses({commit, state}, payload = {}) {
      try {
        const {
          page = 1,
          perPage = 20,
          sortBy = 'messages',
          sortOrder = -1,
          addressContains = ''
        } = payload;

        // Use the helper function to fetch addresses from v1 API
        const result = await fetchAddresses(state.api_server, {
          page,
          perPage,
          sortBy,
          sortOrder,
          addressContains
        });

        // Update store with fetched data
        commit("set_addresses_pagination", result.pagination);
        commit("set_addresses_stats", result.addressesObject);

      } catch (error) {
        commit("set_addresses_pagination", {page: 1, per_page: 20,total: 0})
        commit("set_addresses_stats", []);
        console.error("Failed to load addresses:", error);
      }
    },
    async load_address_stats({commit, state}, address) {
      try {
        // Use our helper function to get address stats with exact address matching
        const result = await fetchAddresses(state.api_server, {
          addressContains: address,
          perPage: 20  // Get enough addresses to ensure we find the one we're looking for
        });

        // Find the exact match for this address
        const addressItem = Object.values(result.addressesObject)
          .find(item => item.address === address);

        if (addressItem) {
          commit("set_address_stats", addressItem);
        } else {
          // If no exact match found, set empty stats
          commit("set_address_stats", {});
        }
      } catch (error) {
        console.error("Failed to get address stats:", error);
        commit("set_address_stats", {});
      }
    },
    async load_address_aggregates({commit, state}, address) {
      try {
          const { data } = await axios.get(
            `${state.api_server.protocol}//${state.api_server.host}/api/v0/aggregates/${address}.json`,
            { params: { limit: 1000 } }
          );

          const aggregates = data.data;

          if (aggregates === null) {
            commit("set_address_aggregates", {});
          } else {
            commit("set_address_aggregates", aggregates);
            if (aggregates.profile !== undefined) {
              commit('store_profile', {
                address: address,
                profile: aggregates['profile']
              });
            }
          }
      } catch (err) {
        console.error("Cannot fetch aggregate:", err);
        commit("set_address_aggregates", {});
      }
    },
    async load_address_messages({commit, state}, payload) {
      const {
        address,
        page = state.address_detail.messages_pagination.page,
        perPage = state.address_detail.messages_pagination.per_page
      } = payload;

      try {
        const response = await axios.get(
            `${state.api_server.protocol}//${state.api_server.host}/api/v0/messages.json`,
            {
              params: {
                'addresses': address,
                'pagination': perPage,
                'page': page
              }
            }
          );

          commit("set_address_messages", response.data.messages || []);
          commit("set_address_messages_pagination", {
            page: page,
            per_page: perPage,
            total: response.data.pagination_total || 0
          });
      } catch (error) {
        console.error("Failed to load messages:", error);
        commit("set_address_messages", []);
        commit("set_address_messages_pagination", {
          page: page,
          per_page: perPage,
          total: 0
        });
      }
    },
    async load_address_posts({commit, state}, payload) {
      const {
        address,
        page = state.address_detail.posts_pagination.page,
        perPage = state.address_detail.posts_pagination.per_page
      } = payload;

      try {
         const response = await axios.get(
            `${state.api_server.protocol}//${state.api_server.host}/api/v1/posts.json`,
            {
              params: {
                'types': 'blog_pers,comment,social',
                'addresses': address,
                'pagination': perPage,
                'page': page
              }
            }
          );
         commit("set_address_posts", response.data.posts || []);
         commit("set_address_posts_pagination", {
           page: page,
           per_page: perPage,
           total: response.data.pagination_total || 0
         });
      } catch (error) {
        console.error("Failed to load posts:", error);
        commit("set_address_posts", []);
        commit("set_address_posts_pagination", {
          page: page,
          per_page: perPage,
          total: 0
        });
      }
    },
    async load_address_detail({dispatch}, address) {
      await dispatch('load_address_stats', address);
      await dispatch('load_address_aggregates', address);
      await dispatch('load_address_messages', {address});
      await dispatch('load_address_posts', {address});
    }
  }
})
