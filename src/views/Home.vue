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
            <b-list-group flush class="compact">
              <b-list-group-item v-for="message of last_messages" :key="message.item_hash">
                <div class="d-flex w-100 font-small">
                  <figure v-if="message.type==='POST'"
                          class="avatar avatar-sm mr-2 bg-primary text-white"
                          data-initial="Post"></figure>
                  <figure v-if="message.type==='AGGREGATE'"
                          class="avatar avatar-sm mr-2 bg-info text-white"
                          data-initial="Aggr"></figure>
                  <div>
                    <b-link class="hash break-xs">{{message.item_hash}}</b-link><br />
                    <span v-b-tooltip.hover :title="dateformat(message.time)">
                      {{reldateformat(message.time)}}
                    </span>
                  </div>
                  <div>
                    By <b-link class="address break-xs">{{message.sender}}</b-link><br />
                    <span v-if="message.content.address !== message.sender">
                      For <b-link class="address break-xs">{{message.content.address}}</b-link>
                    </span>
                  </div>
                  <div class="ml-auto">
                    <b-badge v-b-tooltip.hover :title="confirm_text(message)"
                    variant="light">{{message.confirmations.length}}</b-badge>
                  </div>
                </div>
              </b-list-group-item>
              <b-list-group-item>Dapibus ac facilisis in</b-list-group-item>
              <b-list-group-item>Vestibulum at eros</b-list-group-item>
            </b-list-group>
            <b-card-body class="p-0">
              <b-table responsive striped hover table-class="compact mb-0 table-nowrap"
              :items="last_messages" :fields="messages_fields" :busy.sync="!last_messages.length">
                <template slot="item_hash" slot-scope="data">
                  <b-link>{{data.item.item_hash}}</b-link>
                </template>
                <template slot="time" slot-scope="data">
                  {{dateformat(data.item.time)}}
                </template>
            </b-table>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col cols="12" md="6">
          <b-card no-body>
            <b-card-header>
              <h4>Last posts only</h4>
              <div class="card-header-action">
                <b-link class="btn btn-primary" to="/posts">View all <i class="fas fa-chevron-right"></i></b-link>
              </div>
            </b-card-header>
            <b-card-body class="p-0">
              <b-table responsive striped hover table-class="compact mb-0"
                       :items="last_posts" :fields="posts_fields" :busy.sync="!last_posts.length">
                <template slot="time" slot-scope="data">
                  {{dateformat(data.item.time)}}
                </template>
              </b-table>
            </b-card-body>
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

export default {
  name: 'home',
  data() {
    return {
      last_messages: [],
      last_posts: [],
      messages_fields: [
        { key: 'item_hash', label: 'Item Hash', class: 'hash'},
        { key: 'type', label: 'Type' },
        { key: 'time', label: 'Time' }
      ],
      posts_fields: [
        { key: 'item_hash', label: 'Item Hash', class: 'hash'},
        { key: 'type', label: 'Post Type' },
        { key: 'time', label: 'Time' }
      ],
    }
  },
  computed: {
    displayed_last_posts() {
      return this.last_posts.map(post => ({
        'hash': post.item_hash,
        'type': post.type,
        'sender': post.sender,
        'address': post.address,
        'ref': post.ref,
        'time': post.time
      }))
    },
    displayed_last_messages() {
    },
    ...mapState({
      account: 'account',
      api_server: 'api_server',
      last_broadcast: 'last_broadcast'
    })
  },
  components: {
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
      await this.update_posts()
    },
    async update_messages() {
      let response = await axios.get(`${this.api_server}/api/v0/messages.json`, {
        params: {
          'pagination': 10,
          'page': 1
        }
      })

      this.last_messages = response.data.messages // display all for now
    },
    async update_posts() {
      let response = await axios.get(`${this.api_server}/api/v0/messages.json`, {
        params: {
          'msgType': 'POST',
          'pagination': 10,
          'page': 1
        }
      })

      this.last_posts = response.data.messages // display all for now
    },
    async quick_post() {
      let tx = await create_post(
        this.selected_account.address, 'own_feed',
        this.quick_post_body, this.quick_post_title
      )
      this.$store.commit('sign_tx', {
        'tx': tx,
        'reason': 'New post on public timeline'
      })
    }
  },
  async mounted() {
    // We may not have a correct account list yet... So wait a bit.
    this.$nextTick(this.update.bind(this))
    //setTimeout(this.update.bind(this), 500)
    setInterval(this.update.bind(this), 2000)
  }
}
</script>
