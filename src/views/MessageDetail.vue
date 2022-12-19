<template>
  <div>
    <div class="section-header">
      <h1>Message detail</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">{{hash}}</h2>
      <p class="section-lead" v-if="chain&&address&&type">
        Looking for this {{type}} message on {{chain}}, sent by <address-link :address="address" :chain="chain" />
        <span v-if="messages.length"> {{reldateformat(messages[0].time)}}</span>.
      </p>
      <p class="section-lead" v-if="messages.length > 1">Warning, there is {{messages.length}} messages corresponding! All are shown, one under the other.</p>
    </div>
    <div v-for="message in messages">
      <b-row class="flex-column-reverse flex-xl-row">
        <b-col cols="12" xl="8">
          <b-card no-body>
            <b-tabs pills card>
              <b-tab title="Message Content" v-if="message.content">
                <b-card-body>
                  <vue-json-pretty
                    :data="message.content" highlightMouseoverNode>
                  </vue-json-pretty>
                </b-card-body>
              </b-tab>
              <b-tab title="Signature" v-if="message.signature">
                <b-card-body>
                  <vue-json-pretty
                    :data="{signature: message.signature}" highlightMouseoverNode>
                  </vue-json-pretty>
                </b-card-body>
              </b-tab>
              <b-tab title="Confirmations" v-if="message.confirmations">
                <b-card-body>
                  <vue-json-pretty
                    :data="message.confirmations" highlightMouseoverNode>
                  </vue-json-pretty>
                </b-card-body>
              </b-tab>
              <b-tab title="Raw stored">
                <b-card-body>
                  <vue-json-pretty
                    :data="message" highlightMouseoverNode>
                  </vue-json-pretty>
                </b-card-body>
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
        <b-col cols="12" xl="4">
          <b-card no-body>
            <b-card-header>
              <h4>Message details</h4>
            </b-card-header>
            <b-list-group flush>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                <span>Message type</span>
                <span>{{message.type}}</span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                <span>Channel</span>
                <span>{{message.channel}}</span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                <span>Sender</span>
                <span><address-link :address="message.sender" :chain="message.chain" /></span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between"
                                 v-if="(message.content) && (message.sender !== message.content.address)">
                <span>On behalf of</span>
                <span><address-link :address="message.content.address" /></span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                <span>Message time</span>
                <span>{{dateformat(message.time)}}</span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between"
                                 v-if="message.content && message.content.time">
                <span>Content time</span>
                <span>{{dateformat(message.content.time)}}</span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                <span>Confirmations</span>
                <div v-if="message.confirmations">
                  <span v-for="conf in message.confirmations">
                    {{conf.chain}} (block
                      <a v-if="conf.chain=='NULS'" target="_blank" rel="noopener noreferrer"
                         :href="'https://testnet.nuls.world/transactions/'+getHash(conf.hash)">
                         {{conf.height}}</a>
                      <a v-if="conf.chain=='NULS2'" target="_blank" rel="noopener noreferrer"
                         :href="'https://nuls.world/transactions/'+getHash(conf.hash)">
                         {{conf.height}}</a>
                      <a v-else-if="conf.chain=='BNB'" target="_blank" rel="noopener noreferrer"
                         :href="'https://explorer.binance.org/tx/'+getHash(conf.hash)">
                         {{conf.height}}</a>
                      <a v-else-if="conf.chain=='ETH'" target="_blank" rel="noopener noreferrer"
                         :href="'https://etherscan.io/tx/'+getHash(conf.hash)">
                         {{conf.height}}</a>
                      <a v-else>{{conf.height}}</a>)<br />
                  </span>
                </div>
                <span v-else>None</span>
              </b-list-group-item>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between"
                                 v-if="message.type === 'PROGRAM'">
                <span>Execute on</span>
                <span><a :href="'https://aleph.sh/vm/' + message.item_hash">aleph.sh</a></span>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import moment from 'moment'
import AddressLink from '@/components/AddressLink'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

function base64toHEX (base64) {
  const buffer = Buffer.from(base64, 'base64')
  return buffer.toString('hex')
}

export default {
  name: 'message-detail',
  components: {
    VueJsonPretty, AddressLink
  },
  computed: mapState({
    account: state => state.account,
    api_server: state => state.api_server,
    profiles: state => state.profiles
  }),
  data () {
    return {
      messages: []
    }
  },
  props: {
    hash: String,
    chain: String,
    address: String,
    type: String
  },
  methods: {
    dateformat (dt) {
      return moment.unix(dt).format('lll')
    },
    reldateformat (dt) {
      return moment.unix(dt).fromNow()
    },
    getHash (hash) {
      if (hash.$binary !== undefined) { return base64toHEX(hash.$binary) } else { return hash }
    },
    async update () {
      await this.getMessages()
      this.$forceUpdate()
    },
    async getMessages () {
      let args = {
        hashes: this.hash
      }

      if (this.address) { args['addresses'] = this.address }

      if (this.type) { args['msgType'] = this.type }

      let response = await axios.get(
        `https://${this.api_server}/api/v0/messages.json`,
        { params: args }
      )
      this.messages = response.data.messages
    }
  },
  watch: {
    async hash () {
      await this.update()
    }
  },
  async mounted () {
    await this.update()
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
