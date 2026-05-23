<template>
  <div>
    <div class="section-body">
      <DashboardStats />

      <b-row>
        <b-col cols="12" md="6">
          <b-card no-body>
            <b-card-header>
              <h4>Last messages <b-spinner small class="ml-3" label="Loading messages" v-if="query_status.is_loading" />
              </h4>
              <div class="card-header-action">
                <b-link class="btn btn-primary" to="/messages">View all <i class="fas fa-chevron-right"></i></b-link>
              </div>
            </b-card-header>
            <MessageList :messages="last_messages" class="compact" animate />
          </b-card>
        </b-col>
        <b-col cols="12" md="6">
          <b-card no-body>
            <b-card-header>
              <h4>Most active addresses</h4>
              <div class="card-header-action">
                <b-link class="btn btn-primary" to="/addresses">View all <i class="fas fa-chevron-right"></i></b-link>
              </div>
            </b-card-header>
            <b-table responsive table-class="compact" :items="active_addresses" :fields="addresses_fields">
              <template slot="address" slot-scope="data">
                <AddressLink :address="data.item.address" class="address break-xs" />
              </template>
              <template slot="time" slot-scope="data">
                {{ dateformat(data.item.time) }}
              </template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import MessageList from '@/components/MessageList.vue'
import MessageTable from '@/components/MessageTable.vue'
import AddressLink from '@/components/AddressLink'
import DashboardStats from '@/components/DashboardStats.vue'

const QUEUE_SIZE = 15

export default {
  name: 'home',
  data() {
    return {
      last_messages: [],
      message_socket: null,
      reconnectTimer: null,
      reconnectDelay: 1000,
      metricsTimer: null,
      ratesTimer: null,
      messages_fields: [
        { key: 'item_hash', label: 'Item Hash', class: 'hash' },
        { key: 'type', label: 'Type' },
        { key: 'time', label: 'Time' }
      ],
      addresses_fields: [
        { key: 'address', label: 'Address' },
        { key: 'messages', label: 'Messages', class: 'text-right' },
        { key: 'post', label: 'Posts', class: 'text-right' },
        { key: 'aggregate', label: 'Aggregates', class: 'text-right' }
      ],
      query_status: {
        is_loading: false,
        has_error: false
      }
    }
  },
  computed: {
    active_addresses() {
      return Object.entries(this.addresses_stats)
        .map(([address, stats]) => ({ address, ...stats }))
        .sort((a, b) => b.messages - a.messages).slice(0, 25)
    },
    ...mapState({
      account: 'account',
      api_server: 'api_server',
      last_broadcast: 'last_broadcast',
      addresses_stats: 'addresses_stats'
    })
  },
  components: {
    MessageList,
    MessageTable,
    AddressLink,
    DashboardStats
  },
  methods: {
    dateformat(dt) {
      return dayjs.unix(dt).format('lll')
    },
    reldateformat(dt) {
      return dayjs.unix(dt).fromNow()
    },
    confirm_text(message) {
      let chains = [...new Set(message.confirmations.map(c => c.chain))];
      return `${message.confirmations.length} confirmations:\n${chains.join(', ')}`;
    },
    pushToMessageQueue(data) {
      this.last_messages.unshift(data)
      this.last_messages.pop()
    },
    openWS() {
      const socket = new WebSocket(`${this.api_server.ws_protocol}//${this.api_server.host}/api/ws0/messages?history=${QUEUE_SIZE}`)
      socket._intentionallyClosed = false

      // Batch the firsts messages in a dedicated queue
      // so the "MessageList" component only updates once it is filled
      const prefillQueue = []
      this.last_messages = []
      this.query_status.is_loading = true
      this.query_status.has_error = false

      socket.addEventListener('message', (e) => {
        // First message proves the connection is healthy — reset backoff.
        this.reconnectDelay = 1000
        let data
        try {
          this.query_status.is_loading = false
          data = JSON.parse(e.data)
          if (!data)
            return
        } catch (error) {
          console.log('Could not parse socket response')
          return
        }

        if (this.last_messages.length === QUEUE_SIZE)
          return this.pushToMessageQueue(data)

        prefillQueue.unshift(data)
        if (prefillQueue.length === QUEUE_SIZE)
          this.last_messages = [...prefillQueue]
      })

      socket.addEventListener('error', () => this.query_status.has_error = true)
      socket.addEventListener('close', () => {
        if (socket._intentionallyClosed) return
        this.scheduleReconnect()
      })
      this.message_socket = socket
    },
    scheduleReconnect() {
      if (this.reconnectTimer) return
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
        this.openWS()
      }, this.reconnectDelay)
    },
    closeWS() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
      if (this.message_socket) {
        this.message_socket._intentionallyClosed = true
        this.message_socket.close()
        this.message_socket = null
      }
    },
    startDashboardPolling() {
      this.$store.dispatch('load_metrics')
      this.$store.dispatch('load_message_rates')
      if (!this.metricsTimer) {
        this.metricsTimer = setInterval(() => this.$store.dispatch('load_metrics'), 10000)
      }
      if (!this.ratesTimer) {
        this.ratesTimer = setInterval(() => this.$store.dispatch('load_message_rates'), 60000)
      }
    },
    stopDashboardPolling() {
      if (this.metricsTimer) { clearInterval(this.metricsTimer); this.metricsTimer = null }
      if (this.ratesTimer) { clearInterval(this.ratesTimer); this.ratesTimer = null }
    },
    onVisibilityChange() {
      if (document.hidden) {
        this.stopDashboardPolling()
      } else {
        this.startDashboardPolling()
      }
    }
  },
  mounted() {
    this.openWS()
    this.$store.dispatch('load_addresses', {
      page: 1,
      perPage: 25,
      sortBy: 'total',
      sortOrder: -1
    })
    this.startDashboardPolling()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },
  watch: {
    'api_server.host'() {
      this.closeWS()
      this.reconnectDelay = 1000
      this.openWS()
      this.startDashboardPolling()
    }
  },
  beforeDestroy() {
    this.closeWS()
    this.stopDashboardPolling()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }
}
</script>

<style lang="scss" scoped>

</style>
