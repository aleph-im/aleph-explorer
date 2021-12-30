<template>
  <div>
    <b-dropdown id="dropdown-1" variant="outline-light"
                :text="selchannel?selchannel:'All channels'" class="position-absolute mt-n5 rounded ml-4 ml-lg-0">
      <b-dropdown-item @click="select_channel(null)">All channels</b-dropdown-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item v-for="channel of channels" @click="select_channel(channel)" :key="channel">
        {{channel}}
      </b-dropdown-item>
    </b-dropdown>
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
        <!--
        <b-card-body class="p-0">
          <MessageTable :messages="last_messages" striped hover table-class="compact mb-0 table-nowrap" />
        </b-card-body> -->
      </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MessageList from '@/components/MessageList.vue'
import axios from 'axios'
import VueJsonPretty from 'vue-json-pretty'

export default {
  name: 'about',
  data() {
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
    MessageList, VueJsonPretty
  },
  methods: {
    async refresh() {
      await this.getMessages()
      await this.getChannels()
    },
    async getMessages() {
      let response = await axios.get(`${this.api_server}/api/v0/messages.json`, {
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
    async getChannels() {
      let response = await axios.get(`${this.api_server}/api/v0/channels/list.json`)
      let channels = response.data.channels

      this.channels = channels // display all for now
    },
    select_channel(channel) {
      this.selchannel = channel
      this.getMessages()
    }
  },
  watch: {
    async $route(to, from) {
      await this.refresh()
    },
    async page() {
      await this.refresh()
    }
  },
  async created() {
    await this.refresh()
  }
}
</script>
