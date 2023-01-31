<template>
  <div>
    <div class="position-absolute mt-n5 rounded ml-4 ml-lg-0" style="min-width: 200px;">
      <v-select :options="channels" @input="select_channel" placeholder="Filter channels" :value="selected_channel"
        multiple />
    </div>


    <b-card no-body class="card-primary">
      <b-card-header class="d-flex justify-content-between">
        <h4>Messages</h4>

        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="4" class="mb-0" size="sm"
          v-if="!isLoading"></b-pagination>
      </b-card-header>

      <MessageList :messages="messages" class="compact" detailed />

      <b-card-footer class="d-flex justify-content-between bg-whitesmoke">
        Total: {{ total_msg }}
        <b-pagination v-model="page" :total-rows="total_msg" :per-page="per_page" limit="9" class="mb-0" size="sm"
          v-if="!isLoading"></b-pagination>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MessageList from '@/components/MessageList.vue'
import axios from 'axios'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'messages',
  data() {
    return {
      messages: [],
      channels: [],
      selected_channel: null,
      per_page: 15,
      total_msg: 0,
      page: 1,
      isLoading: true
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
    async refresh() {
      await this.getMessages()
      await this.getChannels()
    },
    async getMessages() {
      let response = await axios.get(`${this.api_server.protocol}//${this.api_server.host}/api/v0/messages.json`, {
        params: {
          'pagination': this.per_page,
          'page': this.page,
          'channels': this.selected_channel ? this.selected_channel.join(',') : undefined
        }
      })
      let messages = response.data.messages

      this.messages = messages // display all for now
      this.total_msg = response.data.pagination_total
    },
    async getChannels() {
      const response = await axios.get(`${this.api_server.protocol}//${this.api_server.host}/api/v0/channels/list.json`)
      try {
        const { channels } = response.data

        // FIXME
        // A null channel is stopping the select component from rendering
        this.channels = channels.filter(x => x != null)
      } catch (error) {
        this.channels = [] // display all for now
      }
    },
    select_channel(channel) {
      if (channel.length === 0) {
        channel = null
      }

      return this.$router.push({
        name: 'messages',
        query: channel && { channels: channel.join(','), page: 1 }
      })
    },
    async loadQP(qp) {
      if (qp) {
        try {
          this.selected_channel = qp.channels && qp.channels.split(',')
          this.page = parseInt(qp.page) || 1
        }
        catch (err) {
          console.log('Could not load query parameter')
          console.log(err)
        }
      }

      await this.getMessages()
    }
  },
  watch: {
    async $route(to) {
      const { query } = to
      await this.loadQP(query)
    },
    async 'api_server.host'() {
      await this.refresh()
    }
  },
  async created() {
    await this.getChannels()
    await this.loadQP(this.$route.query)

    this.$watch('page', page => {
      this.$router.push({
        name: 'messages',
        query: {
          ...this.$route.query,
          page
        }
      })
    })

    // Fixes a bug in the pagination component 
    // Where it would not display the correct number at page load
    // src: https://github.com/bootstrap-vue/bootstrap-vue/issues/6960#issuecomment-1103795173
    this.isLoading = false
  }
}
</script>

<style>
:root {
  /*
    Overriding the default text size from the vue-select component
    more info: https://vue-select.org/guide/css.html#css-variables
  */
  --vs-font-size: unset;
  --vs-selected-bg: #6777ef;
  --vs-selected-color: white;
  --vs-selected-border-color: #6777ef;
}

.vs__selected {
  --vs-controls-color: #FFF;
}
</style>