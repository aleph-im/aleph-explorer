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
      <h2 class="section-title">This is Example Page</h2>
      <p class="section-lead">This page is just an example for you to create your own page.</p>
      <div class="card">
        <div class="card-header">
          <h4>Example Card</h4>
        </div>
        <div class="card-body">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
        <div class="card-footer bg-whitesmoke">
          This is card footer
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import axios from 'axios'
import MessageList from '@/components/MessageList.vue'
import MessageTable from '@/components/MessageTable.vue'
import AddressLink from '@/components/AddressLink'

export default {
  name: 'home',
  data() {
    return {
      last_messages: [],
      polling: null,
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
    async update() {
      await this.update_messages()
    },
    async update_messages() {
      let response = await axios.get(`${this.api_server}/api/v0/messages.json`, {
        params: {
          'pagination': 15,
          'page': 1
        }
      })

      this.last_messages = response.data.messages // display all for now
    }
  },
  async mounted() {
    // We may not have a correct account list yet... So wait a bit.
    this.$nextTick(this.update.bind(this))
    //setTimeout(this.update.bind(this), 500)
    this.polling = setInterval(this.update.bind(this), 2000)
  },
  beforeDestroy () {
  	clearInterval(this.polling)
  }
}
</script>

<style lang="scss" scoped>
</style>
