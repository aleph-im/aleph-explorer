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
    addresses_stats: {},
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
    channels: [],
    channels_loaded_for: null,
    metrics: null,
    metrics_observed_at: null,
    eth_block_observed_at: null,
    eth_block_committed_at: null,
    message_rates: { h1: null, h24: null },
    network: { ccn_count: null, observed_at: null },
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
    },
    set_channels (state, payload) {
      state.channels = payload.channels
      state.channels_loaded_for = payload.host
    },
    set_metrics (state, payload) {
      const previousHeight = state.metrics
        && state.metrics.pyaleph_status_chain_eth_last_committed_height
      const newHeight = payload && payload.pyaleph_status_chain_eth_last_committed_height
      // Wall-clock fallback used by the countdown if the RPC lookup fails.
      // Reset only when the height actually advances so the countdown survives
      // intermediate metrics polls.
      if (newHeight !== undefined && newHeight !== previousHeight) {
        state.eth_block_observed_at = Date.now()
      }
      state.metrics = payload
      state.metrics_observed_at = Date.now()
    },
    set_eth_block_committed_at (state, timestamp) {
      state.eth_block_committed_at = timestamp
    },
    set_message_rates (state, payload) {
      state.message_rates = payload
    },
    set_network_size (state, payload) {
      state.network = { ...payload, observed_at: Date.now() }
    }
  },
  actions: {
    async load_metrics({commit, dispatch, state}) {
      try {
        const previousHeight = state.metrics
          && state.metrics.pyaleph_status_chain_eth_last_committed_height
        const { data } = await axios.get(
          `${state.api_server.protocol}//${state.api_server.host}/metrics.json`
        )
        commit('set_metrics', data)
        const newHeight = data && data.pyaleph_status_chain_eth_last_committed_height
        if (newHeight !== undefined && newHeight !== previousHeight) {
          dispatch('load_eth_block_timestamp', newHeight)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    },
    async load_network_size({commit, state}) {
      // The canonical corechannel aggregate is published by the Aleph
      // foundation address. Other addresses also have corechannel entries,
      // so we filter explicitly to avoid picking the wrong one.
      try {
        const { data } = await axios.get(
          `${state.api_server.protocol}//${state.api_server.host}/api/v0/aggregates`,
          {
            params: {
              keys: 'corechannel',
              addresses: '0xa1B3bb7d2332383D96b7796B908fB7f7F3c2Be10',
              pagination: 1
            }
          }
        )
        const agg = data && data.aggregates && data.aggregates[0]
        const nodes = agg && agg.content && agg.content.nodes
        if (Array.isArray(nodes)) {
          commit('set_network_size', { ccn_count: nodes.length })
        }
      } catch (error) {
        console.error('Failed to fetch network size:', error)
      }
    },
    async load_eth_block_timestamp({commit}, height) {
      try {
        const hex = '0x' + height.toString(16)
        const { data } = await axios.post('https://ethereum-rpc.publicnode.com', {
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [hex, false],
          id: 1
        })
        const tsHex = data && data.result && data.result.timestamp
        if (!tsHex) return
        commit('set_eth_block_committed_at', parseInt(tsHex, 16) * 1000)
      } catch (error) {
        console.error('Failed to fetch ETH block timestamp:', error)
      }
    },
    async load_message_rates({commit, state}) {
      const now = Math.floor(Date.now() / 1000)
      const baseUrl = `${state.api_server.protocol}//${state.api_server.host}/api/v0/messages.json`
      try {
        // We only read pagination_total here, never the rows themselves.
        // contentFormat=none drops the content JSONB entirely from the
        // response body, which is much smaller and faster on the server.
        const [h1, h24] = await Promise.all([
          axios.get(baseUrl, { params: { startDate: now - 3600, pagination: 1, page: 1, contentFormat: 'none' } }),
          axios.get(baseUrl, { params: { startDate: now - 86400, pagination: 1, page: 1, contentFormat: 'none' } })
        ])
        commit('set_message_rates', {
          h1: h1.data.pagination_total ?? null,
          h24: h24.data.pagination_total ?? null
        })
      } catch (error) {
        console.error('Failed to fetch message rates:', error)
      }
    },
    async load_channels({commit, state}) {
      if (state.channels_loaded_for === state.api_server.host) return
      try {
        const response = await axios.get(
          `${state.api_server.protocol}//${state.api_server.host}/api/v0/channels/list.json`
        )
        const channels = (response.data.channels || []).filter(c => c != null)
        commit('set_channels', { channels, host: state.api_server.host })
      } catch (error) {
        console.error('Failed to fetch channels:', error)
        commit('set_channels', { channels: [], host: state.api_server.host })
      }
    },
    async load_addresses({commit, state}, payload = {}) {
      try {
        const {
          page = 1,
          perPage = 20,
          sortBy = 'total',
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
        commit("set_addresses_stats", {});
        console.error("Failed to load addresses:", error);
      }
    },
    async load_address_stats({commit, state}, address) {
      try {
        // A full-length address as the substring filter matches at most itself,
        // so a single-row page is enough to find it (or confirm it's absent).
        const result = await fetchAddresses(state.api_server, {
          addressContains: address,
          perPage: 1
        });
        const [addressItem] = Object.values(result.addressesObject);
        commit("set_address_stats", addressItem || {});
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
                'page': page,
                // Headers-only; the address messages list never renders
                // the full content JSONB.
                'contentFormat': 'headers'
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
