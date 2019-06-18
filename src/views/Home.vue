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
            <b-card-body class="p-0">
              <b-table responsive striped hover table-class="compact mb-0"
              :items="last_messages" :fields="messages_fields"></b-table>
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
                       :items="last_posts" :fields="posts_fields"></b-table>
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
import axios from 'axios'

export default {
  name: 'home',
  data() {
    return {
      last_posts: [],
      messages_fields: [
        { key: 'item_hash', label: 'Item Hash'},
        { key: 'type', label: 'Type' },
        { key: 'time', label: 'Time' }
      ],
      posts_fields: [
        { key: 'item_hash', label: 'Item Hash'},
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
