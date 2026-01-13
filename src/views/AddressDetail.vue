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
            Total: {{messages_pagination.total}}
            <b-pagination
              v-model="current_msg_page"
              :total-rows="messages_pagination.total"
              :per-page="messages_pagination.per_page"
              class="ml-auto mb-0" size="sm"
              @change="onMessagesPageChange"
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
                <div class="profile-widget-item-value">{{stats.messages || 0}}</div>
              </div>
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Posts</div>
                <div class="profile-widget-item-value">{{stats.posts || 0}}</div>
              </div>
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Aggregates</div>
                <div class="profile-widget-item-value">{{stats.aggregates || 0}}</div>
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

    <b-card no-body v-if="Object.keys(aggregates).length > 0" class="card-info">
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
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

export default {
  name: 'address-detail',
  data() {
    return {
      current_msg_page: 1,
      current_post_page: 1,
      component_key: 0,
      polling: null
    }
  },
  computed: {
    ...mapState({
      account: state => state.account,
      api_server: state => state.api_server,
      profiles: state => state.profiles,
      address_detail: state => state.address_detail
    }),
    stats() {
      return this.address_detail.stats || {}
    },
    aggregates() {
      return this.address_detail.aggregates || {}
    },
    messages() {
      return this.address_detail.messages || []
    },
    messages_pagination() {
      return this.address_detail.messages_pagination || { page: 1, per_page: 10, total: 0 }
    },
    posts() {
      return this.address_detail.posts || []
    },
    posts_pagination() {
      return this.address_detail.posts_pagination || { page: 1, per_page: 20, total: 0 }
    }
  },
  components: {
    MessageList, AccountAvatar, AccountName, VueJsonPretty
  },
  props: {
    address: String,
    chain: String
  },
  methods: {
    loadAllData() {
      this.$store.dispatch('load_address_detail', this.address)
    },
    refreshMessages() {
      this.$store.dispatch('load_address_messages', {
        address: this.address,
        page: this.current_msg_page
      })
    },
    refreshPosts() {
      this.$store.dispatch('load_address_posts', {
        address: this.address,
        page: this.current_post_page
      })
    },
    partialRefresh() {
      this.refreshMessages()
      this.refreshPosts()
    },
    onMessagesPageChange(newPage) {
      this.current_msg_page = newPage
      this.refreshMessages()
    }
  },
  watch: {
    async $route(to, from) {
      this.loadAllData()
    }
  },
  created() {
    this.loadAllData()
  },
  mounted() {
    // Set up polling to refresh messages and posts data
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
}
</style>
