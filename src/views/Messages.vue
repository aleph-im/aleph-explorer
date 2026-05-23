<template>
  <div>
    <template v-if="showAdvancedFilters">
      <b-card>
        <b-container fluid>
          <b-row class="mb-2">
            <b-col sm="12" class="d-flex justify-content-start">
              <span class="filtertoggle filtertoggle-inline" @click="toggleAdvancedFilters()">
                <i class="fas fa-chevron-up"></i>
                Hide advanced filters
              </span>
            </b-col>
          </b-row>

          <b-row class="my-1">
            <b-col sm="6">
              <b-form-group id="fg_channel" label="Channel(s)" label-for="_input_channels">
                <v-select :options="channels" @input="e => setQP('channels', e?.join(','))" placeholder="Filter channels"
                  :value="filters.channels" id="_input_channels" multiple />
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
                  <b-form-radio value="INSTANCE">Instance</b-form-radio>
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

          <b-row class="my-1">
            <b-col sm="12" class="d-flex justify-content-start">
              <span class="filtertoggle filtertoggle-inline" @click="toggleMoreFilters()">
                <i class="fas" :class="showMoreFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                {{ showMoreFilters ? 'Hide more filters' : 'Show more filters' }}
              </span>
            </b-col>
          </b-row>

          <template v-if="showMoreFilters">
            <b-row class="my-1">
              <b-col sm="6">
                <b-form-group id="fg_hashes" label="Item hashes (comma separated)" label-for="_input_hashes">
                  <b-form-input id="_input_hashes" size="sm" :value="filters.hashes" @update="e => setQP('hashes', e)"
                    debounce="750" trim :disabled="isAggregatesView"></b-form-input>
                </b-form-group>
              </b-col>
              <b-col sm="6">
                <b-form-group id="fg_tags" label="Tags (comma separated)" label-for="_input_tags">
                  <b-form-input id="_input_tags" size="sm" :value="filters.tags" @update="e => setQP('tags', e)"
                    debounce="750" trim :disabled="isAggregatesView"></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row class="my-1">
              <b-col sm="6">
                <b-form-group id="fg_content_types" label="Content types (comma separated)"
                  label-for="_input_content_types">
                  <b-form-input id="_input_content_types" size="sm" :value="filters.contentTypes"
                    @update="e => setQP('contentTypes', e)" debounce="750" trim
                    :disabled="isAggregatesView"></b-form-input>
                </b-form-group>
              </b-col>
              <b-col sm="6">
                <b-form-group id="fg_chains" label="Chains (comma separated, e.g. ETH,AVAX,SOL)"
                  label-for="_input_chains">
                  <b-form-input id="_input_chains" size="sm" :value="filters.chains"
                    @update="e => setQP('chains', e)" debounce="750" trim
                    :disabled="isAggregatesView"></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row class="my-1">
              <b-col sm="6">
                <b-form-group id="fg_statuses" label="Message status" label-for="_input_statuses">
                  <v-select :options="statusOptions" placeholder="Any status"
                    :value="filters.statuses" id="_input_statuses" multiple
                    @input="e => setQP('statuses', e?.join(','))" :disabled="isAggregatesView" />
                </b-form-group>
              </b-col>
              <b-col sm="3">
                <b-form-group id="fg_block_from" label="From block" label-for="_input_block_from">
                  <b-form-input id="_input_block_from" type="number" size="sm" :value="filters.startBlock"
                    @update="e => setQP('startBlock', e)" debounce="750" trim
                    :disabled="isAggregatesView"></b-form-input>
                </b-form-group>
              </b-col>
              <b-col sm="3">
                <b-form-group id="fg_block_to" label="To block" label-for="_input_block_to">
                  <b-form-input id="_input_block_to" type="number" size="sm" :value="filters.endBlock"
                    @update="e => setQP('endBlock', e)" debounce="750" trim
                    :disabled="isAggregatesView"></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>
          </template>
        </b-container>
      </b-card>
    </template>

    <b-card no-body class="card-primary">
      <b-card-header class="d-flex align-items-center flex-wrap messages-header">
        <h4 class="mb-0 mr-3">
          {{ isAggregatesView ? 'Aggregates' : 'Messages' }}
          <b-spinner small class="ml-2" label="Loading" v-if="query_status.is_loading" />
        </h4>

        <template v-if="!showAdvancedFilters">
          <div class="header-channel-filter mr-3">
            <v-select :options="channels" @input="e => setQP('channels', e?.join(','))" placeholder="Filter channels"
              :value="filters.channels" multiple />
          </div>
          <span class="filtertoggle filtertoggle-header" @click="toggleAdvancedFilters()">
            Show advanced filters
          </span>
        </template>

        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="4" class="mb-0 ml-auto"
          size="sm" v-if="!hasPageLoaded"></b-pagination>
      </b-card-header>

      <b-table v-if="isAggregatesView" responsive table-class="compact mb-0" :items="aggregates"
        :fields="aggregate_fields" stacked="sm">
        <template v-slot:cell(address)="data">
          <AddressLink :address="data.value" class="address" />
        </template>
        <template v-slot:cell(content)="data">
          <code class="aggregate-content">{{ contentPreview(data.value) }}</code>
        </template>
      </b-table>
      <MessageList v-else :messages="messages" class="compact" detailed />

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
import AddressLink from '@/components/AddressLink.vue'
import { toUnixTimestamp } from '../helpers.js'

export default {
  name: 'messages',
  data() {
    return {
      messages: [],
      aggregates: [],
      per_page: 15,
      total_msg: 0,
      page: 1,
      hasPageLoaded: true,
      showAdvancedFilters: false,
      showMoreFilters: false,
      filters: {
        channels: null,
        sender: null,
        type: 'ALL',
        keys: null,
        refs: null,
        startDate: null,
        endDate: null,
        hashes: null,
        tags: null,
        contentTypes: null,
        chains: null,
        statuses: null,
        startBlock: null,
        endBlock: null
      },
      statusOptions: ['processed', 'pending', 'rejected', 'forgotten', 'removing', 'removed'],
      aggregate_fields: [
        { key: 'address', label: 'Address' },
        { key: 'key', label: 'Key' },
        { key: 'content', label: 'Content' }
      ],
      query_status: {
        is_loading: false,
        has_error: false
      }
    }
  },
  computed: {
    isAggregatesView() {
      return this.filters.type === 'AGGREGATE'
    },
    ...mapState({
      account: state => state.account,
      api_server: state => state.api_server,
      profiles: state => state.profiles,
      channels: state => state.channels
    })
  },
  props: {
    msg_type: {
      type: String
    }
  },
  components: {
    MessageList,
    AddressLink
  },
  methods: {
    async refresh() {
      await this.loadData()
      await this.$store.dispatch('load_channels')
    },
    contentPreview(value) {
      const json = JSON.stringify(value)
      return json.length > 200 ? json.slice(0, 200) + '…' : json
    },
    async loadData() {
      if (this.isAggregatesView) {
        await this.getAggregates()
      } else {
        await this.getMessages()
      }
    },
    async getAggregates() {
      this.query_status.is_loading = true
      try {
        const response = await axios.get(
          `${this.api_server.protocol}//${this.api_server.host}/api/v0/aggregates`,
          {
            params: {
              pagination: this.per_page,
              page: this.page,
              addresses: this.filters.sender || undefined,
              keys: this.filters.keys ? this.filters.keys.replace(/\s/g, '') : undefined
            }
          }
        )
        this.aggregates = response.data.aggregates || []
        this.total_msg = response.data.pagination_total || 0
      } finally {
        this.query_status.is_loading = false
      }
    },
    csvParam(value) {
      return value ? value.replace(/\s/g, '') || undefined : undefined
    },
    intParam(value) {
      const n = parseInt(value, 10)
      return Number.isFinite(n) ? n : undefined
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
          refs: this.csvParam(this.filters.refs),
          hashes: this.csvParam(this.filters.hashes),
          tags: this.csvParam(this.filters.tags),
          contentTypes: this.csvParam(this.filters.contentTypes),
          chains: this.csvParam(this.filters.chains),
          msgStatuses: this.filters.statuses && this.filters.statuses.length
            ? this.filters.statuses.join(',')
            : undefined,
          startBlock: this.intParam(this.filters.startBlock),
          endBlock: this.intParam(this.filters.endBlock),
        }
      })
      let messages = response.data.messages
      this.query_status.is_loading = false

      this.messages = messages // display all for now
      this.total_msg = response.data.pagination_total
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
    toggleMoreFilters() {
      return this.$router.push({
        name: 'messages',
        query: {
          ...this.$route.query,
          showMoreFilters: Number(!this.showMoreFilters) || undefined
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
          this.showMoreFilters = Boolean(parseInt(qp.showMoreFilters))
          this.page = parseInt(qp.page) || 1
          this.filters.channels = qp.channels && qp.channels?.split(',')
          this.filters.sender = qp.sender || null
          this.filters.type = qp.type || 'ALL'
          this.filters.startDate = qp.startDate
          this.filters.endDate = qp.endDate
          this.filters.keys = qp.keys
          this.filters.refs = qp.refs
          this.filters.hashes = qp.hashes || null
          this.filters.tags = qp.tags || null
          this.filters.contentTypes = qp.contentTypes || null
          this.filters.chains = qp.chains || null
          this.filters.statuses = qp.statuses ? qp.statuses.split(',') : null
          this.filters.startBlock = qp.startBlock || null
          this.filters.endBlock = qp.endBlock || null
        }
        catch (err) {
          console.log('Could not load query parameter')
          console.log(err)
        }
      }

      await this.loadData()
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
    await this.$store.dispatch('load_channels')
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
  --vs-selected-bg: #029AFF;
  --vs-selected-color: white;
  --vs-selected-border-color: #029AFF;
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

.filtertoggle.filtertoggle-inline {
  color: inherit;
  font-size: 0.85em;
}

.messages-header .filtertoggle-header {
  color: inherit;
  font-size: 0.9em;
  white-space: nowrap;
}

.messages-header .header-channel-filter {
  min-width: 220px;
  max-width: 360px;
  flex: 1 1 220px;
}

.aggregate-content {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85em;
  color: #555;
}
</style>
