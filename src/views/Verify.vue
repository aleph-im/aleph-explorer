<template>
  <div>
    <div class="section-header">
      <h1>Verify on-chain anchoring</h1>
    </div>
    <div class="section-body">
      <p class="verify-lead">
        Paste an Aleph item_hash to prove the message is in the Aleph database,
        <br />
        anchored on Ethereum, and physically present in the batch JSON stored on IPFS.
      </p>

      <b-card no-body class="verify-form-card mb-4">
        <b-card-body>
          <b-input-group>
            <b-form-input v-model="query" placeholder="Aleph item_hash (64 hex chars)"
              @keyup.enter="run" :disabled="loading" trim />
            <b-input-group-append>
              <b-button variant="primary" :disabled="!query || loading" @click="run">
                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-shield-alt'"></i>
                Verify
              </b-button>
            </b-input-group-append>
          </b-input-group>
          <p class="text-muted small mt-2 mb-0" v-if="!result && !error">
            The lookup happens entirely in your browser against the public Aleph API,
            a public Ethereum RPC, and a public IPFS gateway. No backend in between.
          </p>
        </b-card-body>
      </b-card>

      <!-- Step 1: Aleph lookup -->
      <b-card v-if="step1" no-body class="verify-step mb-3" :class="step1.statusClass">
        <b-card-body>
          <div class="d-flex align-items-center mb-2">
            <i class="step-icon fas" :class="step1.icon"></i>
            <h3 class="step-title mb-0 ml-2">{{ step1.title }}</h3>
          </div>
          <div v-if="step1.message" class="verify-step__msg">{{ step1.message }}</div>
          <dl v-if="step1.fields" class="verify-fields">
            <template v-for="field in step1.fields">
              <dt :key="field.label + '-l'">{{ field.label }}</dt>
              <dd :key="field.label + '-v'">
                <router-link v-if="field.to" :to="field.to">{{ field.value }}</router-link>
                <a v-else-if="field.href" :href="field.href" target="_blank" rel="noopener noreferrer">
                  <code>{{ field.value }}</code> <i class="fas fa-external-link-alt fa-xs"></i>
                </a>
                <code v-else>{{ field.value }}</code>
              </dd>
            </template>
          </dl>
        </b-card-body>
      </b-card>

      <!-- Steps 2 + 3 (placeholders for upcoming work) -->
      <b-card v-if="step1 && step1.canChain" no-body class="verify-step verify-step--placeholder mb-3">
        <b-card-body>
          <div class="d-flex align-items-center">
            <i class="step-icon fas fa-link text-muted"></i>
            <h3 class="step-title mb-0 ml-2 text-muted">Anchored on Ethereum</h3>
          </div>
          <div class="text-muted small mt-1">
            Decoding the batch transaction and resolving the IPFS payload will be
            wired up in the next steps of this page.
          </div>
        </b-card-body>
      </b-card>

      <b-card v-if="error" no-body class="verify-step verify-step--error mb-3">
        <b-card-body>
          <div class="d-flex align-items-center">
            <i class="step-icon fas fa-exclamation-triangle"></i>
            <h3 class="step-title mb-0 ml-2">Lookup failed</h3>
          </div>
          <div class="verify-step__msg">{{ error }}</div>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'verify',
  data() {
    return {
      query: '',
      loading: false,
      result: null,
      error: null
    }
  },
  computed: {
    ...mapState({
      api_server: state => state.api_server
    }),
    step1() {
      if (this.loading) {
        return {
          title: 'Looking up in Aleph…',
          icon: 'fa-spinner fa-spin',
          statusClass: 'verify-step--pending',
          canChain: false
        }
      }
      if (!this.result) return null

      const m = this.result
      const conf = m.confirmations && m.confirmations[0]
      const ethConf = m.confirmations && m.confirmations.find(c => c.chain === 'ETH')

      const baseFields = [
        { label: 'item_hash', value: m.item_hash },
        { label: 'type', value: m.type },
        { label: 'sender', value: m.sender,
          to: { name: 'address-detail', params: { chain: m.chain, address: m.sender } } },
        { label: 'channel', value: m.channel || '(none)' }
      ]

      if (ethConf) {
        return {
          title: 'Found in Aleph and anchored on Ethereum',
          icon: 'fa-check-circle',
          statusClass: 'verify-step--ok',
          message: null,
          fields: [
            ...baseFields,
            { label: 'ETH block', value: '#' + ethConf.height,
              href: 'https://etherscan.io/block/' + ethConf.height },
            { label: 'anchor tx', value: ethConf.hash,
              href: 'https://etherscan.io/tx/' + ethConf.hash }
          ],
          canChain: true
        }
      }

      if (conf) {
        return {
          title: 'Found in Aleph, anchored on ' + conf.chain,
          icon: 'fa-info-circle',
          statusClass: 'verify-step--warn',
          message: 'No Ethereum confirmation yet. This verifier only walks the ETH anchor for now.',
          fields: baseFields,
          canChain: false
        }
      }

      return {
        title: 'Found in Aleph, not yet anchored',
        icon: 'fa-hourglass-half',
        statusClass: 'verify-step--warn',
        message: 'The message exists in the network but has no on-chain confirmation yet. Try again in a few minutes.',
        fields: baseFields,
        canChain: false
      }
    }
  },
  methods: {
    async run() {
      const hash = (this.query || '').trim()
      if (!hash) return
      this.loading = true
      this.result = null
      this.error = null
      try {
        const url = `${this.api_server.protocol}//${this.api_server.host}/api/v0/messages/${hash}`
        const { data } = await axios.get(url)
        if (!data || !data.message) {
          this.error = 'No message found with that item_hash.'
          return
        }
        this.result = data.message
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.error = 'No message found with that item_hash.'
        } else {
          this.error = 'Could not reach the Aleph API. ' + (err.message || '')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.verify-lead {
  font-size: 1.15rem;
  color: #2b1865;
  margin-bottom: 1.5rem;
  max-width: 56em;
}

.verify-form-card {
  border: 1px solid rgba(81, 0, 205, 0.15);
}

.verify-step {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-left-width: 4px;
}

.verify-step--ok {
  border-left-color: #47ff59;
}

.verify-step--warn {
  border-left-color: #fecd17;
}

.verify-step--error {
  border-left-color: #d9245a;
}

.verify-step--pending {
  border-left-color: #5100cd;
}

.verify-step--placeholder {
  border-left-color: rgba(0, 0, 0, 0.15);
  border-style: dashed;
}

.step-icon {
  font-size: 1.4rem;
  width: 1.6em;
  text-align: center;
}

.verify-step--ok .step-icon { color: #1e9c2e; }
.verify-step--warn .step-icon { color: #c69200; }
.verify-step--error .step-icon { color: #d9245a; }
.verify-step--pending .step-icon { color: #5100cd; }

.step-title {
  font-size: 1.05rem;
  font-weight: 600;
}

.verify-step__msg {
  color: #495057;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.verify-fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
}

.verify-fields dt {
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.7rem;
  align-self: center;
}

.verify-fields dd {
  margin: 0;
  word-break: break-all;
}

.verify-fields code {
  background: rgba(81, 0, 205, 0.06);
  color: #2b1865;
  padding: 0.1em 0.35em;
  border-radius: 0.25em;
}
</style>
