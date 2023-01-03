<template>
  <div>
    <div class="position-absolute mt-n5 rounded ml-4 ml-lg-0" style="min-width: 200px;">
      <v-select :options="channels" @input="select_channel" placeholder="Filter channels" />
    </div>

    <b-card no-body class="card-primary">
      <b-card-header class="d-flex justify-content-between">
        <h4>Messages</h4>

        <b-pagination
          v-model="page"
          :total-rows="total_msg"
          :per-page="per_page"
          limit="4"
          class="mb-0" size="sm"
        ></b-pagination>
      </b-card-header>

      <MessageList :messages="messages" class="compact" detailed />

      <b-card-footer class="d-flex justify-content-between bg-whitesmoke">
        Total: {{total_msg}}
        <b-pagination
          v-model="page"
          :total-rows="total_msg"
          :per-page="per_page"
          limit="9"
          class="mb-0" size="sm"
        ></b-pagination>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MessageList from '@/components/MessageList.vue'
import axios from 'axios'
import 'vue-select/dist/vue-select.css';

export default {
  name: 'about',
  data () {
    return {
      messages: [],
      channels: [],
      selchannel: null,
      per_page: 15,
      total_msg: 0,
      page: 1
    }
  },
  computed: mapState({
    account: state => state.account,
    api_server: state => state.api_server,
    profiles: state => state.profiles
  }),
  props: {
    msg_type: {
      type: String
    }
  },
  components: {
    MessageList
  },
  methods: {
    async refresh () {
      await this.getMessages()
      await this.getChannels()
    },
    async getMessages () {
      let response = await axios.get(`${this.api_server.protocol}//${this.api_server.host}/api/v0/messages.json`, {
        params: {
          'pagination': this.per_page,
          'page': this.page,
          'channels': this.selchannel ? this.selchannel : undefined
        }
      })
      let messages = response.data.messages

      this.messages = messages // display all for now
      this.total_msg = response.data.pagination_total
    },
    async getChannels () {
      let response = await axios.get(`${this.api_server.protocol}//${this.api_server.host}/api/v0/channels/list.json`)
      let channels = response.data.channels

      this.channels = channels // display all for now
    },
    select_channel (channel) {
      this.selchannel = channel
      this.getMessages()
    },
  },
  watch: {
    async $route (to, from) {
      await this.refresh()
    },
    async page () {
      await this.refresh()
    },
    async 'api_server.host'() {
      await this.refresh()
    }
  },
  async created () {
    await this.refresh()
  }
}
</script>

<style>
:root{
  /*
    Overriding the default text size from the vue-select component
    more info: https://vue-select.org/guide/css.html#css-variables
  */
  --vs-font-size: unset;
}
</style>