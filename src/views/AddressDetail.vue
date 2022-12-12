<template>
  <div>
    <div class="section-header">
      <h1>Address detail</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">
        {{address}}
      </h2>
      <p class="section-lead" v-if="chain">Address of the {{chain}} network.</p>
    </div>
    <b-row class="flex-column-reverse flex-md-row">
      <b-col cols="12" md="6">
        <b-card no-body class="card-primary">
          <b-card-header>
            <h4>Messages</h4>
          </b-card-header>
          <MessageList :messages="messages" class="compact" />

          <b-card-footer class="d-flex justify-content-between bg-whitesmoke">
            Total: {{total_msg}}
            <b-pagination
              v-model="current_msg_page"
              :total-rows="total_msg"
              :per-page="msg_per_page"
              class="ml-auto mb-0" size="sm"
            ></b-pagination>
          </b-card-footer>
        </b-card>
      </b-col>
      <b-col cols="12" md="6">
        <div class="card profile-widget card-success">
          <div class="profile-widget-header">
            <AccountAvatar :address="address" avatarclass="profile-widget-picture avatar-xxl" />
            <div class="profile-widget-items">
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Messages</div>
                <div class="profile-widget-item-value">{{stats ? stats.messages : 0}}</div>
              </div>
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Posts</div>
                <div class="profile-widget-item-value">{{stats ? stats.posts : 0}}</div>
              </div>
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Aggregates</div>
                <div class="profile-widget-item-value">{{stats ? stats.aggregates : 0}}</div>
              </div>
            </div>
          </div>
          <div class="profile-widget-description pb-0">
            <div class="profile-widget-name"><AccountName :address="address" :profiles="profiles" /></div>
            <p v-if="aggregates.profile && aggregates.profile.bio">{{aggregates.profile.bio}}</p>
          </div>
        </div>
      </b-col>
    </b-row>

    <b-card no-body v-if="aggregates" class="card-info">
      <b-card-header>
        <h4>Aggregates detail</h4>
      </b-card-header>
      <b-tabs pills card vertical>
        <b-tab v-for="[key, value] of Object.entries(aggregates)"
          :title="key"
          :key="key+component_key">
          <b-card-body>
            <vue-json-pretty
              :data="value" highlightMouseoverNode>
            </vue-json-pretty>
          </b-card-body>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AccountAvatar from '@/components/AccountAvatar.vue'
import AccountName from '@/components/AccountName.vue'
import MessageList from '@/components/MessageList.vue'
import {aggregates} from 'aleph-js'
import axios from 'axios'
import VueJsonPretty from 'vue-json-pretty'

export default {
  name: 'address-detail',
  data() {
    return {
      aggregates: {},
      stats: {},
      messages: [],
      msg_per_page: 10,
      total_msg: 0,
      current_msg_page: 1,
      posts: [],
      posts_per_page: 20,
      total_posts: 0,
      current_post_page: 1,
      component_key: 0
    }
  },
  computed: mapState({
    account: state => state.account,
    api_server: state => state.api_server,
    profiles: state => state.profiles
  }),
  components: {
    MessageList, AccountAvatar, AccountName, VueJsonPretty
  },
  props: {
    address: String,
    chain: String
  },
  methods: {
    async refresh() {
      await this.getStats()
      await this.getAggregates()
      await this.getPosts()
      await this.getMessages()
    },
    async partialRefresh() {
      await this.getPosts()
      await this.getMessages()
    },
    async getAggregates() {
      this.aggregates = await aggregates.fetch(this.address, {api_server: this.api_server})
      if (this.aggregates === null)
        this.aggregates = {}
      else if (this.aggregates.profile !== undefined)
        this.$store.commit('store_profile', {
          address: this.address,
          profile: this.aggregates['profile']
        })
      this.component_key = this.component_key + 1;
    },
    async getPosts() {
      // own posts`
      let response = await axios.get(`${this.api_server}/api/v0/posts.json`, {
        params: {
          'types': 'blog_pers,comment,social',
          'addresses': this.address,
          'pagination': this.per_page,
          'page': this.current_page
        }
      })
      let posts = response.data.posts

      this.posts = posts // display all for now
      this.total_posts = response.data.pagination_total
      // this.current_post_page = response.data.pagination_page
    },
    async getMessages() {
      // own posts`
      let response = await axios.get(`${this.api_server}/api/v0/messages.json`, {
        params: {
          'addresses': this.address,
          'pagination': this.msg_per_page,
          'page': this.current_msg_page
        }
      })
      let messages = response.data.messages

      this.messages = messages // display all for now
      this.total_msg = response.data.pagination_total
      // this.current_msg_page = response.data.pagination_page
    },
    async getStats() {
      let response = await axios.get(`${this.api_server}/api/v0/addresses/stats.json`, {
        params: {
          addresses: [this.address]
        }
      })
      let stats = response.data.data[this.address]
      if (stats !== undefined) { this.$set(this, 'stats', stats) } else { this.$set(this, 'stats', {}) }
    }
  },
  watch: {
    async $route(to, from) {
      await this.refresh()
    },
    async current_msg_page() {
      await this.getMessages()
    }
  },
  async created() {
    await this.refresh()
  },
  async mounted() {
    // We may not have a correct account list yet... So wait a bit.
    // this.$nextTick(this.partialUpdate.bind(this))
    //setTimeout(this.update.bind(this), 500)
    this.polling = setInterval(this.partialRefresh.bind(this), 10000)
  },
  beforeDestroy () {
  	clearInterval(this.polling)
  }
}
</script>

<style lang="css">
.vjs-tree {
  font-size: 10px !important;
  line-height: 1.5em;
  word-wrap: anywhere;
}
</style>
