<template>
  <div>
    <div class="section-body">
      <DashboardStats />

      <TaglineRotator />

      <b-row>
        <b-col cols="12" md="6">
          <b-card no-body>
            <b-card-header>
              <h4 class="d-flex align-items-center flex-wrap mb-0">
                <span class="mr-2">Last messages</span>
                <span class="ws-status" :class="wsStatusClass"
                  v-b-tooltip.hover :title="wsStatusTitle">
                  <span class="ws-status__dot"></span>
                </span>
                <b-badge v-if="!query_status.has_error" variant="light"
                  class="ws-rate ml-2" v-b-tooltip.hover
                  title="Messages received in this tab over the last 5 minutes">
                  +{{ recentTimes.length }} /5min
                </b-badge>
                <b-spinner small class="ml-3" label="Loading messages"
                  v-if="query_status.is_loading" />
              </h4>
              <div class="card-header-action">
                <b-link class="btn btn-primary" to="/messages">View all <i class="fas fa-chevron-right"></i></b-link>
              </div>
            </b-card-header>
            <div class="messages-list-header">
              <span class="col-hash">#</span>
              <span class="col-subtype ml-auto d-none d-xl-block">Sub Type / Key</span>
              <span class="col-confirmed ml-auto">Confirmed</span>
            </div>
            <MessageList :messages="last_messages" class="compact" animate />
          </b-card>
        </b-col>
        <b-col cols="12" md="6">
          <b-card no-body>
            <b-card-header>
              <h4>Most active addresses <b-spinner small class="ml-3" label="Loading addresses"
                v-if="addresses_loading" /></h4>
              <div class="card-header-action">
                <b-link class="btn btn-primary" to="/addresses">View all <i class="fas fa-chevron-right"></i></b-link>
              </div>
            </b-card-header>
            <b-table responsive table-class="compact home-addresses-table" :items="active_addresses"
              :fields="addresses_fields">
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
import AddressLink from '@/components/AddressLink'
import DashboardStats from '@/components/DashboardStats.vue'
import TaglineRotator from '@/components/TaglineRotator.vue'

const QUEUE_SIZE = 15

export default {
  name: 'home',
  metaInfo: {
    title: null, // keep the bare brand title on the dashboard
    meta: [
      { vmid: 'description', name: 'description',
        content: 'Live dashboard for the Aleph Cloud network: total messages, pending queue, last on-chain commit, message rate, anchoring countdown.' }
    ]
  },
  data() {
    return {
      last_messages: [],
      message_socket: null,
      reconnectTimer: null,
      reconnectDelay: 1000,
      metricsTimer: null,
      ratesTimer: null,
      addresses_loading: false,
      recentTimes: [],
      rateTickTimer: null,
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
    wsStatusClass() {
      if (this.query_status.has_error) return 'ws-status--error'
      if (this.query_status.is_loading) return 'ws-status--connecting'
      return 'ws-status--live'
    },
    wsStatusTitle() {
      if (this.query_status.has_error) return 'Live stream disconnected'
      if (this.query_status.is_loading) return 'Connecting to live stream…'
      return 'Live stream connected'
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
    AddressLink,
    DashboardStats,
    TaglineRotator
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
    recordMessageTick() {
      this.recentTimes.push(Date.now())
      this.pruneRecentTimes()
    },
    pruneRecentTimes() {
      // Sliding 5-minute window; pruned every 5s so the badge ticks down
      // visibly when no new messages arrive.
      const cutoff = Date.now() - 5 * 60 * 1000
      if (this.recentTimes.length && this.recentTimes[0] <= cutoff) {
        this.recentTimes = this.recentTimes.filter(t => t > cutoff)
      }
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
        // First message proves the connection is healthy. Reset backoff.
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

        this.recordMessageTick()
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
    this.addresses_loading = true
    this.$store.dispatch('load_addresses', {
      page: 1,
      perPage: 25,
      sortBy: 'total',
      sortOrder: -1
    }).finally(() => { this.addresses_loading = false })
    this.startDashboardPolling()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    // Tick every 5s to keep the "/60s" chip in sync even when no new
    // messages arrive (so the count decreases visibly as time passes).
    this.rateTickTimer = setInterval(this.pruneRecentTimes, 5000)
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
    if (this.rateTickTimer) { clearInterval(this.rateTickTimer); this.rateTickTimer = null }
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }
}
</script>

<style lang="scss" scoped>
.ws-status {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.ws-status__dot {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 0 currentColor;
}

.ws-status--live { color: #1e9c2e; }
.ws-status--live .ws-status__dot {
  animation: ws-pulse 1.6s ease-out infinite;
}

.ws-status--connecting { color: #c69200; }
.ws-status--connecting .ws-status__dot {
  animation: ws-pulse 2.4s ease-out infinite;
  opacity: 0.7;
}

.ws-status--error { color: #d9245a; }
.ws-status--error .ws-status__dot {
  animation: none;
}

@keyframes ws-pulse {
  0%   { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
  70%  { box-shadow: 0 0 0 0.4rem rgba(0, 0, 0, 0); opacity: 0.8; }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); opacity: 1; }
}

.ws-rate {
  font-weight: 500;
  font-size: 0.72rem;
  vertical-align: middle;
}

.messages-list-header {
  display: flex;
  align-items: center;
  padding: 0.55rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 700 !important;
  color: #000;
  text-transform: none;
  background: transparent;
  border-bottom: 1px solid #dee2e6;
}

.messages-list-header .col-hash {
  flex: 0 0 50%;
}

.messages-list-header .col-confirmed {
  text-align: right;
}

/* Match the messages-list-header look on the addresses table thead.
   ::v-deep is needed because the b-table renders thead/th internally,
   outside the scoped data-attribute. */
::v-deep .home-addresses-table thead th {
  padding: 0.55rem 1.25rem !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #000 !important;
  text-transform: none !important;
  background: transparent !important;
  border-bottom: 1px solid #dee2e6 !important;
}

/* Match MessageList row padding + border on the addresses table body. */
::v-deep .home-addresses-table tbody td {
  height: auto !important;
  padding: 0.5rem 1.25rem !important;
  vertical-align: middle;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

::v-deep .home-addresses-table tbody tr:last-child td {
  border-bottom: none;
}

/* Keep the table within its card on all viewports; the b-table-stacked
   layout otherwise reports natural content width via min-content. */
::v-deep .home-addresses-table,
::v-deep .home-addresses-table .table-responsive {
  width: 100%;
  max-width: 100%;
}
</style>
