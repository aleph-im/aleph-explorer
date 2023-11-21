<template>
  <div>
    <b-toast :visible="programSourceError" variant="danger">
      Cannot fetch program source
    </b-toast>

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
          <b-card no-body v-if="message.type === 'PROGRAM'">
            <b-card-header>
              <h4>Program details</h4>
            </b-card-header>
            <b-list-group flush>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                    <span>Run program</span>
                    <span><a :href="'https://aleph.sh/vm/' + message.item_hash" target="_blank" referrerpolicy="no-referrer">
                      <i class="fas fa-external-link-alt" />&nbsp;aleph.sh
                    </a></span>
                  </b-list-group-item>

                  <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                    <span>Runtime</span>
                    <span><a :href="`/message/${message.content.runtime.ref}`">
                      <template v-if="message.content.runtime.comment">
                        {{ message.content.runtime.comment }}
                      </template>
                      <template v-else>
                        custom
                      </template>
                      </a></span>
                  </b-list-group-item>

                  <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                    <span>Source code</span>
                    <template v-if="isProgramSourceLoading">
                      <b-spinner small class="ml-3" label="Loading messages" />
                    </template>
                    <template v-else-if="programSource">
                      <span><a :href="programSource" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-download" />&nbsp;
                        Download
                        <template v-if="message.content.code.encoding === 'plain'">
                          script
                        </template>
                        <template v-else>
                          ({{ message.content.code.encoding }})
                        </template>
                      </a></span>
                    </template>
                  </b-list-group-item>

                  <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                    <span>vCPUs</span>
                    <span>{{  message.content.resources.vcpus }}</span>
                  </b-list-group-item>

                  <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                    <span>RAM</span>
                    <span>{{ Number(message.content.resources.memory / 1024).toFixed(2) }}&nbsp;Gb</span>
                  </b-list-group-item>
            </b-list-group>
          </b-card>

          <b-card no-body>
            <b-card-header>
              <h4>Message details</h4>
            </b-card-header>
            <b-list-group flush v-if="message.status !== 'forgotten'">
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
            </b-list-group>
            <b-list-group flush v-else>
              <b-list-group-item class="d-flex w-100 font-small justify-content-between">
                <span>This message has been forgotten by the sender</span>
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
      messages: [],
      programSource: null,
      isProgramSourceLoading: false,
      programSourceError: false
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
      if(this.messages[0].type === 'PROGRAM') await this.getProgramSource()
      this.$forceUpdate()
    },
    async getMessages () {
      if(!this.address || !this.type){
        const q = await axios.get(
          `${this.api_server.protocol}//${this.api_server.host}/api/v0/messages/${this.hash}`,
        )
        this.messages = [q.data]

        return
      }

      let response = await axios.get(
        `${this.api_server.protocol}//${this.api_server.host}/api/v0/messages.json`,
        { params: {
            hashes: this.hash,
            adresses: this.address,
            msgType: this.type
          } 
        }
      )
      this.messages = response.data.messages
    },
    async getProgramSource () {
      try {
        const ref = this.messages[0].content.runtime.ref
  
        if(ref || !this.isProgramSourceLoading || !this.programSource){
          this.isProgramSourceLoading = true
          
          const srcQuery = await axios.get(`https://api2.aleph.im/api/v0/messages.json?hashes=${ref}`)
  
          if(!srcQuery.data.messages[0].content.item_hash){
            throw new Error('No source code found')
          }

          const rawSrc = srcQuery.data.messages[0].content.item_hash

          // Shady hack to retrieve the source code from the IPFS gateway instead of the Aleph API
          if(rawSrc.startsWith('Q') || rawSrc.startsWith('bafy'))
            this.programSource = 'https://ipfs.io/ipfs/' + rawSrc
          else
            this.programSource = 'https://api2.aleph.im/api/v0/storage/raw/' + rawSrc
        }

        this.isProgramSourceLoading = false
      } catch (err) {
        this.isProgramSourceLoading = false
        this.programSource = null
        this.programSourceError = true
      }
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
