<template>
  <div>
    <div class="section-body">
      <b-row>
        <b-col cols="12" md="6">
          <b-card no-body>
            <b-card-header>
              <h4>Last messages</h4>
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
            <b-table responsive table-class="compact"
            :items="active_addresses" :fields="addresses_fields">
                <template slot="address" slot-scope="data">
                  <AddressLink :address="data.item.address" class="address break-xs" />
                </template>
                <template slot="time" slot-scope="data">
                  {{dateformat(data.item.time)}}
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
import moment from 'moment'
import MessageList from '@/components/MessageList.vue'
import MessageTable from '@/components/MessageTable.vue'
import AddressLink from '@/components/AddressLink'

const QUEUE_SIZE = 15

export default {
  name: 'home',
  data() {
    return {
      last_messages: [],
      message_socket: null,
      messages_fields: [
        { key: 'item_hash', label: 'Item Hash', class: 'hash'},
        { key: 'type', label: 'Type' },
        { key: 'time', label: 'Time' }
      ],
      addresses_fields: [
        { key: 'address', label: 'Address'},
        { key: 'messages', label: 'Messages', class: 'text-right'},
        { key: 'posts', label: 'Posts', class: 'text-right'},
        { key: 'aggregates', label: 'Aggregates', class: 'text-right'}
      ],
    }
  },
  computed: {
    active_addresses() {
      let items = Object.values(this.addresses_stats)
      items = items.sort((a, b) => b.messages - a.messages).slice(0,25)
      return items
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
    AddressLink
  },
  methods: {
    dateformat (dt) {
      return moment.unix(dt).format('lll')
    },
    reldateformat (dt) {
      return moment.unix(dt).fromNow()
    },
    confirm_text (message) {
      let chains = [...new Set(message.confirmations.map(c => c.chain))];
      return `${message.confirmations.length} confirmations:\n${chains.join(', ')}`;
    },
    pushToMessageQueue (data) {
      const message = data
      this.last_messages.unshift(message)
      this.last_messages.pop()
    }
  },
  async mounted() {
    const socket = new WebSocket(`wss://${this.api_server}/api/ws0/messages?history=${QUEUE_SIZE}`)

    let messageCount = 0
    const prefillQueue = []
    socket.addEventListener('message', (e) => {
      let data
      try {
        data = JSON.parse(e.data)
        if(!data)
          return
      } catch (error) {
        console.log('Could not parse socket response')
      }

      if(messageCount > QUEUE_SIZE)
        return this.pushToMessageQueue(data)

      prefillQueue.unshift(data)
      messageCount++
      if(messageCount === QUEUE_SIZE)
        this.last_messages = [...prefillQueue]
    })
    this.message_socket = socket
  },
  beforeDestroy () {
    this.message_socket.close()
  }
}
</script>

<style lang="scss" scoped>
</style>
