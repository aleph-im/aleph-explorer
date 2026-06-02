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
            <b-col sm="12">
              <b-form-group id="fg_refs" label="Refs (comma separated values)" label-for="_input_refs">
                <b-form-input id="_input_refs" size="sm" :value="filters.refs" @update="e => setQP('refs', e)"
                  debounce="750" trim></b-form-input>
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
                    debounce="750" trim></b-form-input>
                </b-form-group>
              </b-col>
              <b-col sm="6">
                <b-form-group id="fg_tags" label="Tags (comma separated)" label-for="_input_tags">
                  <b-form-input id="_input_tags" size="sm" :value="filters.tags" @update="e => setQP('tags', e)"
                    debounce="750" trim></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row class="my-1">
              <b-col sm="6">
                <b-form-group id="fg_content_types" label="Content types (comma separated)"
                  label-for="_input_content_types">
                  <b-form-input id="_input_content_types" size="sm" :value="filters.contentTypes"
                    @update="e => setQP('contentTypes', e)" debounce="750" trim></b-form-input>
                </b-form-group>
              </b-col>
              <b-col sm="6">
                <b-form-group id="fg_chains" label="Chains (comma separated, e.g. ETH,AVAX,SOL)"
                  label-for="_input_chains">
                  <b-form-input id="_input_chains" size="sm" :value="filters.chains"
                    @update="e => setQP('chains', e)" debounce="750" trim></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-row class="my-1">
              <b-col sm="6">
                <b-form-group id="fg_statuses" label="Message status" label-for="_input_statuses">
                  <v-select :options="statusOptions" placeholder="Any status"
                    :value="filters.statuses" id="_input_statuses" multiple
                    @input="e => setQP('statuses', e?.join(','))" />
                </b-form-group>
              </b-col>
              <b-col sm="3">
                <b-form-group id="fg_block_from" label="From block" label-for="_input_block_from">
                  <b-form-input id="_input_block_from" type="number" size="sm" :value="filters.startBlock"
                    @update="e => setQP('startBlock', e)" debounce="750" trim></b-form-input>
                </b-form-group>
              </b-col>
              <b-col sm="3">
                <b-form-group id="fg_block_to" label="To block" label-for="_input_block_to">
                  <b-form-input id="_input_block_to" type="number" size="sm" :value="filters.endBlock"
                    @update="e => setQP('endBlock', e)" debounce="750" trim></b-form-input>
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
          Messages
          <span class="messages-status-slot ml-2">
            <b-spinner small label="Loading" v-if="query_status.is_loading" />
            <a v-else href="#" class="messages-refresh" @click.prevent="getMessages"
              v-b-tooltip.hover title="Refresh messages" aria-label="Refresh">
              <i class="fas fa-sync-alt"></i>
            </a>
          </span>
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

      <b-table responsive table-class="compact mb-0 messages-table"
        :class="{ 'is-loading-data': query_status.is_loading }"
        :items="messages" :fields="message_fields">
        <template v-slot:cell(item_hash)="data">
          <div class="d-flex align-items-center">
            <MessageIcon :messageType="data.item.type" />
            <div class="ml-2 min-w-0">
              <div class="hash-line">
                <MessageLink :hash="data.item.item_hash" :chain="data.item.chain" :address="data.item.sender"
                  :type="data.item.type" className="break-xs" />
                <span class="text-muted small">By</span>
                <AddressLink :address="data.item.sender" :chain="data.item.chain" class="break-xs" />
                <template v-if="data.item.content && data.item.content.address
                  && data.item.content.address !== data.item.sender">
                  <span class="text-muted small">For</span>
                  <AddressLink :address="data.item.content.address" class="break-xs" />
                </template>
              </div>
              <div class="text-muted small mt-1" v-b-tooltip.hover :title="dateformat(data.item.time)">
                {{ reldateformat(data.item.time) }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:cell(subtype)="data">
          <b-badge v-if="data.item.type === 'AGGREGATE' && data.item.content && data.item.content.key"
            variant="light">{{ data.item.content.key }}</b-badge>
          <b-badge v-else-if="data.item.type === 'POST' && data.item.content && data.item.content.type"
            variant="light">{{ data.item.content.type }}</b-badge>
          <span v-else class="text-muted">-</span>
        </template>

        <template v-slot:cell(channel)="data">
          <span v-if="data.value">{{ data.value }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template v-slot:cell(confirmed)="data">
          <b-badge v-if="data.item.confirmed" variant="light" v-b-tooltip.hover
            :title="confirmTitle(data.item)">confirmed</b-badge>
          <b-badge v-else variant="light">pending</b-badge>
        </template>
      </b-table>

      <b-card-footer class="d-flex justify-content-between bg-whitesmoke">
        Total: {{ total_msg }}
        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="9"
          class="mb-0 d-none d-md-inline-flex" size="sm" v-if="!hasPageLoaded"></b-pagination>
        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="3"
          class="mb-0 d-md-none" size="sm" v-if="!hasPageLoaded"></b-pagination>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import 'vue-select/dist/vue-select.css'

import dayjs from 'dayjs'
import MessageIcon from '@/components/MessageIcon.vue'
import MessageLink from '@/components/MessageLink.vue'
import AddressLink from '@/components/AddressLink.vue'
import { toUnixTimestamp } from '../helpers.js'

export default {
  name: 'messages',
  metaInfo: {
    title: 'Messages',
    meta: [
      { vmid: 'description', name: 'description',
        content: 'Browse and filter every signed message on Aleph: posts, aggregates, files, programs, instances, with chain, channel, status and block-range filters.' }
    ]
  },
  data() {
    return {
      messages: [],
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
      message_fields: [
        { key: 'item_hash', label: '#' },
        { key: 'subtype', label: 'Sub Type / Key' },
        { key: 'channel', label: 'Channel' },
        { key: 'confirmed', label: 'Confirmed', class: 'text-center' }
      ],
      query_status: {
        is_loading: false,
        has_error: false
      }
    }
  },
  computed: {
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
    MessageIcon,
    MessageLink,
    AddressLink
  },
  methods: {
    async refresh() {
      await this.getMessages()
      await this.$store.dispatch('load_channels')
    },
    dateformat(dt) {
      return dayjs.unix(dt).format('lll')
    },
    reldateformat(dt) {
      return dayjs.unix(dt).fromNow()
    },
    confirmTitle(message) {
      if (!message.confirmations || !message.confirmations.length) return 'Confirmed'
      const chains = [...new Set(message.confirmations.map(c => c.chain))]
      return `${message.confirmations.length} confirmations:\n${chains.join(', ')}`
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
          // Headers-only response: we only render content.type / content.key
          // / content.address in the table, never the full content JSONB.
          contentFormat: 'headers',
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

/* Fixed-size slot that holds the spinner or the refresh icon at the
   exact same X / Y, regardless of which element type is inside it. */
.messages-header .messages-status-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  vertical-align: -0.125em; /* matches the default .spinner-border alignment */
}

.messages-header .messages-refresh {
  color: inherit;
  text-decoration: none;
  line-height: 1;
}

.messages-header .messages-refresh:hover,
.messages-header .messages-refresh:focus {
  color: #5100cd;
  text-decoration: none;
}

.messages-header .messages-refresh .fas {
  font-size: 0.85em;
}

.messages-header .header-channel-filter {
  min-width: 220px;
  max-width: 360px;
  flex: 1 1 220px;
}

/* Header + row styling matched with the Home dashboard tables. */
.card table.compact.messages-table thead th {
  padding: 0.55rem 1.25rem !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #000 !important;
  text-transform: none !important;
  background: transparent !important;
  border-bottom: 1px solid #dee2e6 !important;
}

.card table.compact.messages-table tbody td {
  height: auto !important;
  padding: 0.6rem 1.25rem !important;
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.card table.compact.messages-table tbody tr:last-child td {
  border-bottom: none;
}

.is-loading-data {
  opacity: 0.2;
  pointer-events: none;
  transition: opacity 0.2s;
}

.messages-table .min-w-0 {
  min-width: 0;
}

.messages-table .hash-line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
