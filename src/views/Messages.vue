<template>
  <div>
    <template v-if="showAdvancedFilters">
      <div class="position-absolute mt-n5 rounded ml-4 ml-lg-0 d-flex">
        <span class="filtertoggle" @click="toggleAdvancedFilters()">Hide advanced filters</span>
      </div>

      <b-card>
        <b-container fluid>
          <b-row class="my-1">
            <b-col sm="6">
              <b-form-group id="fg_channel" label="Channel(s)" label-for="_input_channels">
                <v-select :options="channels" @input="e => setQP('channels', e?.join(','))"
                  placeholder="Filter channels" :value="filters.channels" id="_input_channels" multiple />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group id="fg_sender" label="Sent by address (exact match)" label-for="_input_sender">
                <b-form-input id="_input_sender" size="sm" :value="filters.sender" @update="e => setQP('sender', e)"
                  debounce="750" trim></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row class="my-1">
            <b-col sm="6">
              <b-form-group id="fg_type" label="Message type" label-for="_input_type">
                <b-form-radio-group id="_input_type" @input="e => setQP('type', e)" :checked="filters.type">
                  <b-form-radio value="ALL">All</b-form-radio>
                  <b-form-radio value="AGGREGATE">Aggregate</b-form-radio>
                  <b-form-radio value="FORGET">Forget</b-form-radio>
                  <b-form-radio value="POST">Post</b-form-radio>
                  <b-form-radio value="PROGRAM">Program</b-form-radio>
                  <b-form-radio value="STORE">Store</b-form-radio>
                </b-form-radio-group>
              </b-form-group>
            </b-col>
            <b-col sm="3">
              <b-form-group id="fg_date_from" label="Sent on or after" label-for="_input_date_from">
                <b-form-input id="date_from" type="date" size="sm" @update="e => setQP('startDate', e)"
                  :value="filters.startDate" debounce="750" trim></b-form-input>
              </b-form-group>
            </b-col>
            <b-col sm="3">
              <b-form-group id="fg_date_to" label="Sent before" label-for="_input_date_to">
                <b-form-input id="date_to" type="date" size="sm" @update="e => setQP('endDate', e)"
                  :value="filters.endDate" debounce="750" trim></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row class="my-1">
            <b-col sm="6">
              <b-form-group id="fg_refs" label="Refs (comma separated values)" label-for="_input_refs">
                <b-form-input id="_input_refs" size="sm" :value="filters.refs" @update="e => setQP('refs', e)"
                  debounce="750" trim></b-form-input>
              </b-form-group>
            </b-col>

            <b-col sm="6">
              <b-form-group id="fg_keys" label="Aggregate key" label-for="_input_keys">
                <b-form-input id="_input_keys" size="sm" :value="filters.keys" @update="e => setQP('keys', e)"
                  debounce="750" trim :disabled="filters.type !== 'AGGREGATE'"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
      </b-card>
    </template>

    <template v-else>
      <div class="position-absolute mt-n5 rounded ml-4 ml-lg-0 d-flex">
        <div style="min-width: 200px;">
          <v-select :options="channels" @input="e => setQP('channels', e?.join(','))" placeholder="Filter channels"
            :value="filters.channels" multiple />
        </div>
        <div class="ml-3 pl-3 border-left border-light d-flex align-items-center">
          <span class="filtertoggle" @click="toggleAdvancedFilters()">Show advanced filters</span>
        </div>
      </div>
    </template>

    <b-card no-body class="card-primary">
      <b-card-header class="d-flex justify-content-between">
        <h4>Messages <b-spinner small class="ml-3" label="Loading messages" v-if="query_status.is_loading" /></h4>

        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="4" class="mb-0" size="sm"
          v-if="!hasPageLoaded"></b-pagination>
      </b-card-header>

      <MessageList :messages="messages" class="compact" detailed />

      <b-card-footer class="d-flex justify-content-between bg-whitesmoke">
        Total: {{ total_msg }}
        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="9" class="mb-0" size="sm"
          v-if="!hasPageLoaded"></b-pagination>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import 'vue-select/dist/vue-select.css'

import MessageList from '@/components/MessageList.vue'
import { toUnixTimestamp } from '../helpers.js'

export default {
  name: 'messages',
  data() {
    return {
      messages: [],
      channels: [],
      per_page: 15,
      total_msg: 0,
      page: 1,
      hasPageLoaded: true,
      showAdvancedFilters: false,
      filters: {
        channels: null,
        sender: null,
        type: 'ALL',
        keys: null,
        refs: null,
        startDate: null,
        endDate: null
      },
      query_status: {
        is_loading: false,
        has_error: false
      }
    }
  },
  computed: mapState({
    account: state => state.account,
    api_server: state => state.api_server,
    profiles: state => state.profiles
  }),
  props: {
    msg_type: {
      type: String
    }
  },
  components: {
    MessageList
  },
  methods: {
    async refresh() {
      await this.getMessages()
      await this.getChannels()
    },
    async getMessages() {
      this.query_status.is_loading = true
      let response = await axios.get(`${this.api_server.protocol}//${this.api_server.host}/api/v0/messages.json`, {
        params: {
          pagination: this.per_page,
          page: this.page,
          channels: this.filters.channels ? this.filters.channels.join(',') : undefined,
          addresses: this.filters.sender || undefined,
          msgType: this.filters.type !== 'ALL' ? this.filters.type : undefined,
          startDate: toUnixTimestamp(this.filters.startDate),
          endDate: toUnixTimestamp(this.filters.endDate),
          refs: this.filters.refs ? this.filters.refs.replaceAll(/\s/gi) : undefined,
          contentKeys: this.filters.keys ? this.filters.keys.replaceAll(/\s/gi) : undefined,
        }
      })
      let messages = response.data.messages
      this.query_status.is_loading = false

      this.messages = messages // display all for now
      this.total_msg = response.data.pagination_total
    },
    async getChannels() {
      const response = await axios.get(`${this.api_server.protocol}//${this.api_server.host}/api/v0/channels/list.json`)
      try {
        const { channels } = response.data

        // FIXME
        // A null channel is stopping the select component from rendering
        this.channels = channels.filter(x => x != null)
      } catch (error) {
        this.channels = []
      }
    },
    toggleAdvancedFilters() {
      return this.$router.push({
        name: 'messages',
        query: {
          showAdvancedFilters: Number(!this.showAdvancedFilters),
          channels: this.filters.channels ? this.filters.channels.join(',') : null
        }
      })
    },
    setQP(name, value) {
      return this.$router.push({
        name: 'messages',
        query: {
          ...this.$route.query,
          [name]: value || undefined,
          page: 1
        }
      })
    },
    async loadQP(qp) {
      if (qp) {
        try {
          this.showAdvancedFilters = Boolean(parseInt(qp.showAdvancedFilters))
          this.page = parseInt(qp.page) || 1
          this.filters.channels = qp.channels && qp.channels?.split(',')
          this.filters.sender = qp.sender || null
          this.filters.type = qp.type || 'ALL'
          this.filters.startDate = qp.startDate
          this.filters.endDate = qp.endDate
          this.filters.keys = qp.keys
          this.filters.refs = qp.refs

        }
        catch (err) {
          console.log('Could not load query parameter')
          console.log(err)
        }
      }

      await this.getMessages()
    }
  },
  watch: {
    async $route(to) {
      const { query } = to
      await this.loadQP(query)
    },
    async 'api_server.host'() {
      await this.refresh()
    }
  },
  async created() {
    await this.getChannels()
    await this.loadQP(this.$route.query)

    this.$watch('page', page => {
      this.$router.push({
        name: 'messages',
        query: {
          ...this.$route.query,
          page
        }
      })
    })

    // Fixes a bug in the pagination component 
    // Where it would not display the correct number at page load
    // src: https://github.com/bootstrap-vue/bootstrap-vue/issues/6960#issuecomment-1103795173
    this.hasPageLoaded = false
  }
}
</script>

<style>
:root {
  /*
    Overriding the default text size from the vue-select component
    more info: https://vue-select.org/guide/css.html#css-variables
  */
  --vs-font-size: unset;
  --vs-selected-bg: #0045ff;
  --vs-selected-color: white;
  --vs-selected-border-color: #0045ff;
}

.vs__selected {
  --vs-controls-color: #FFF;
}

.filtertoggle {
  color: #FFF;
  text-decoration: underline;
  cursor: pointer;
}

.filtertoggle:hover {
  text-decoration: none;
}
</style>