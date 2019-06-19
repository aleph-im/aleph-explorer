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
    <b-row>
      <b-col cols="12" md="6">
        <b-card no-body>
          <b-card-header>
            <h4>Messages</h4>
          </b-card-header>
          <MessageList :messages="messages" class="compact" />
          <b-pagination
            v-model="current_msg_page"
            :total-rows="total_msg"
            :per-page="msg_per_page"
            class="ml-auto mr-3" size="sm"
          ></b-pagination>
          <!--
          <b-card-body class="p-0">
            <MessageTable :messages="last_messages" striped hover table-class="compact mb-0 table-nowrap" />
          </b-card-body> -->
        </b-card>
      </b-col>
      <b-col cols="12" md="6">
        <div class="card profile-widget">
          <div class="profile-widget-header">
            <AccountAvatar :address="address" avatarclass="profile-widget-picture avatar-xxl" />
            <div class="profile-widget-items">
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Posts</div>
                <div class="profile-widget-item-value">187</div>
              </div>
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Messages</div>
                <div class="profile-widget-item-value">6,8K</div>
              </div>
              <div class="profile-widget-item">
                <div class="profile-widget-item-label">Following</div>
                <div class="profile-widget-item-value">2,1K</div>
              </div>
            </div>
          </div>
          <div class="profile-widget-description pb-0">
            <div class="profile-widget-name"><AccountName :address="address" :profiles="profiles" /></div>
            <p v-if="profile && profile.bio">{{profile.bio}}</p>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AccountAvatar from '@/components/AccountAvatar.vue'
import AccountName from '@/components/AccountName.vue'
import MessageList from '@/components/MessageList.vue'
import {fetch_profile} from 'aleph-js/src/api/aggregates'
import axios from 'axios'

export default {
  name: 'address-detail',
  data() {
    return {
      profile: {},
      messages: [],
      msg_per_page: 10,
      total_msg: 0,
      current_msg_page: 1,
      posts: [],
      posts_per_page: 20,
      total_posts: 0,
      current_post_page: 1
    }
  },
  computed: mapState({
    account: state => state.account,
    api_server: state => state.api_server,
    profiles: state => state.profiles
  }),
  components: {
    MessageList, AccountAvatar, AccountName
  },
  props: {
    address: String,
    chain: String
  },
  methods: {
    async refresh() {
      await this.getProfile()
      await this.getMessages()
      await this.getPosts()
    },
    async getProfile() {
      this.profile = await fetch_profile(this.address, {api_server: this.api_server})
      if (this.profile === null)
        this.profile = {}
      else
        this.$store.commit('store_profile', {
          address: this.address,
          profile: this.profile
        })
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
      this.current_post_page = response.data.pagination_page
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
      this.current_msg_page = response.data.pagination_page
    }
  },
  watch: {
    async $route(to, from) {
      await this.getProfile()
      await this.getPosts()
      await this.getMessages()
    },
    async current_msg_page() {
      await this.getMessages()
    }
  },
  async created() {
    await this.refresh()
  }
}
</script>
