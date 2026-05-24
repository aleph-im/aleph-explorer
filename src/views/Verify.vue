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
          <div class="d-flex flex-wrap align-items-center verify-form-row">
            <b-input-group class="verify-form-input">
              <b-form-input v-model="query" placeholder="Aleph item_hash (64 hex chars)"
                @keyup.enter="submit" :disabled="loading" trim />
              <b-input-group-append>
                <b-button variant="primary" :disabled="!query || loading" @click="submit">
                  <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-shield-alt'"></i>
                  Verify
                </b-button>
              </b-input-group-append>
            </b-input-group>
            <b-button v-if="result" variant="outline-secondary" @click="copyLink"
              class="verify-copy-btn" v-b-tooltip.hover :title="copyTooltip">
              <i class="fas" :class="copied ? 'fa-check' : 'fa-link'"></i>
              <span class="ml-1">{{ copied ? 'Copied' : 'Copy link' }}</span>
            </b-button>
          </div>
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

      <!-- Step 1b: Signature verification (cryptographic, chain-agnostic step) -->
      <b-card v-if="stepSig" no-body class="verify-step mb-3" :class="stepSig.statusClass">
        <b-card-body>
          <div class="d-flex align-items-center mb-2">
            <i class="step-icon fas" :class="stepSig.icon"></i>
            <h3 class="step-title mb-0 ml-2">{{ stepSig.title }}</h3>
          </div>
          <div v-if="stepSig.message" class="verify-step__msg">{{ stepSig.message }}</div>
          <dl v-if="stepSig.fields" class="verify-fields">
            <template v-for="field in stepSig.fields">
              <dt :key="field.label + '-l'">{{ field.label }}</dt>
              <dd :key="field.label + '-v'"><code>{{ field.value }}</code></dd>
            </template>
          </dl>
        </b-card-body>
      </b-card>

      <!-- Step 2: decode the anchor tx and surface the IPFS CID -->
      <b-card v-if="step2" no-body class="verify-step mb-3" :class="step2.statusClass">
        <b-card-body>
          <div class="d-flex align-items-center mb-2">
            <i class="step-icon fas" :class="step2.icon"></i>
            <h3 class="step-title mb-0 ml-2">{{ step2.title }}</h3>
          </div>
          <div v-if="step2.message" class="verify-step__msg">{{ step2.message }}</div>
          <dl v-if="step2.fields" class="verify-fields">
            <template v-for="field in step2.fields">
              <dt :key="field.label + '-l'">{{ field.label }}</dt>
              <dd :key="field.label + '-v'">
                <a v-if="field.href" :href="field.href" target="_blank" rel="noopener noreferrer">
                  <code>{{ field.value }}</code> <i class="fas fa-external-link-alt fa-xs"></i>
                </a>
                <code v-else>{{ field.value }}</code>
              </dd>
            </template>
          </dl>
        </b-card-body>
      </b-card>

      <!-- Step 3: fetch the IPFS payload and prove the hash is inside -->
      <b-card v-if="step3" no-body class="verify-step mb-3" :class="step3.statusClass">
        <b-card-body>
          <div class="d-flex align-items-center mb-2">
            <i class="step-icon fas" :class="step3.icon"></i>
            <h3 class="step-title mb-0 ml-2">{{ step3.title }}</h3>
          </div>
          <div v-if="step3.message" class="verify-step__msg">{{ step3.message }}</div>
          <div v-if="step3.gateway" class="verify-gateway">
            served by <code>{{ step3.gateway }}</code>
          </div>
          <div v-if="step3.snippet" class="verify-snippet">
            <span class="verify-snippet__label">Excerpt around the match</span>
            <pre><span>{{ step3.snippet.before }}</span><mark>{{ step3.snippet.match }}</mark><span>{{ step3.snippet.after }}</span></pre>
          </div>
          <details v-if="payload" class="verify-payload">
            <summary>Show full IPFS payload ({{ payloadSize }})</summary>
            <vue-json-pretty :data="payload" :deep="1" highlightMouseoverNode />
          </details>
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
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { verifyMessageSignature } from '@/lib/signature.js'

const ETH_RPC = 'https://ethereum-rpc.publicnode.com'

// IPFS gateways tried in parallel for the verification fetch (Promise.any).
// First successful response wins; the display link in step 2 always points
// at the Aleph-branded gateway for share-ability.
const IPFS_GATEWAY = 'https://ipfs.aleph.cloud/ipfs/'
const IPFS_FALLBACK_GATEWAYS = [
  'https://ipfs.aleph.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/'
]
const IPFS_TIMEOUT_MS = 15000

const SNIPPET_CONTEXT = 80

// Decode a hex byte string as UTF-8 (handles multi-byte chars correctly).
function hexToUtf8Bytes(hex, length) {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

// Aleph anchor txs call a contract method with a single ABI-encoded
// string parameter (the JSON payload). Layout (skip leading 0x):
//   bytes 0..3   : 4-byte function selector
//   bytes 4..35  : ABI offset to the string data (typically 0x20)
//   bytes (offset)..(offset+31) : string length (uint256 big-endian)
//   bytes (offset+32)..        : UTF-8 string bytes, right-padded to 32
function decodeAnchorString(inputHex) {
  const hex = inputHex.startsWith('0x') ? inputHex.slice(2) : inputHex
  if (hex.length < 8 + 64 + 64) {
    throw new Error('Input too short to contain an ABI-encoded string')
  }
  const data = hex.slice(8) // strip selector
  const offset = parseInt(data.slice(0, 64), 16) // typically 32
  const lenStart = offset * 2
  const length = parseInt(data.slice(lenStart, lenStart + 64), 16)
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error('Could not read the string length from the ABI envelope')
  }
  const stringHex = data.slice(lenStart + 64, lenStart + 64 + length * 2)
  return hexToUtf8Bytes(stringHex, length)
}

export default {
  name: 'verify',
  components: { VueJsonPretty },
  props: {
    hash: { type: String, default: null }
  },
  data() {
    return {
      query: '',
      loading: false,
      result: null,
      error: null,
      chainLoading: false,
      chainError: null,
      txInput: null,
      cid: null,
      payloadLoading: false,
      payloadError: null,
      payload: null,
      payloadSerialized: '',
      payloadContainsHash: null,
      payloadGateway: null,
      sigStatus: null,    // 'valid' | 'invalid' | 'missing' | 'error' | null
      sigChain: null,
      sigError: null,
      copied: false,
      copyResetTimer: null
    }
  },
  computed: {
    copyTooltip() {
      return this.copied ? 'Copied to clipboard' : 'Copy permalink to this verification'
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
        { label: 'chain', value: m.chain || '(unknown)' },
        { label: 'sender', value: m.sender,
          to: { name: 'address-detail', params: { chain: m.chain, address: m.sender } } },
        { label: 'channel', value: m.channel || '(none)' }
      ]

      if (ethConf) {
        const txHash = ethConf.hash.startsWith('0x') ? ethConf.hash : '0x' + ethConf.hash
        return {
          title: 'Found in Aleph and anchored on Ethereum',
          icon: 'fa-check-circle',
          statusClass: 'verify-step--ok',
          message: null,
          fields: [
            ...baseFields,
            { label: 'ETH block', value: '#' + ethConf.height,
              href: 'https://etherscan.io/block/' + ethConf.height },
            { label: 'anchor tx', value: txHash,
              href: 'https://etherscan.io/tx/' + txHash }
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
    },
    step2() {
      if (this.chainLoading) {
        return {
          title: 'Decoding the anchor transaction…',
          icon: 'fa-spinner fa-spin',
          statusClass: 'verify-step--pending'
        }
      }
      if (this.chainError) {
        return {
          title: 'Could not decode the anchor transaction',
          icon: 'fa-exclamation-triangle',
          statusClass: 'verify-step--error',
          message: this.chainError
        }
      }
      if (!this.cid) return null
      return {
        title: 'IPFS payload identified',
        icon: 'fa-link',
        statusClass: 'verify-step--ok',
        fields: [
          { label: 'IPFS CID', value: this.cid },
          { label: 'IPFS link', value: IPFS_GATEWAY + this.cid,
            href: IPFS_GATEWAY + this.cid }
        ]
      }
    },
    step3() {
      if (this.payloadLoading) {
        return {
          title: 'Fetching the IPFS payload…',
          icon: 'fa-spinner fa-spin',
          statusClass: 'verify-step--pending'
        }
      }
      if (this.payloadError) {
        return {
          title: 'Could not fetch the IPFS payload',
          icon: 'fa-exclamation-triangle',
          statusClass: 'verify-step--error',
          message: this.payloadError
        }
      }
      if (this.payloadContainsHash === null) return null
      const target = (this.result && this.result.item_hash) || (this.query || '').trim()
      if (this.payloadContainsHash) {
        return {
          title: 'Verified: hash is present in the on-chain payload',
          icon: 'fa-check-circle',
          statusClass: 'verify-step--ok',
          snippet: this.buildSnippet(target),
          gateway: this.payloadGateway
        }
      }
      return {
        title: 'WARNING: hash NOT present in the on-chain payload',
        icon: 'fa-exclamation-triangle',
        statusClass: 'verify-step--error',
        message:
          'The IPFS payload was fetched but does not contain this item_hash. ' +
          'That contradicts what the Aleph API reported and should be investigated.'
      }
    },
    payloadSize() {
      if (!this.payloadSerialized) return ''
      const bytes = this.payloadSerialized.length
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' kB'
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    },
    stepSig() {
      if (!this.sigStatus) return null
      switch (this.sigStatus) {
        case 'valid':
          return {
            title: 'Signature verified',
            icon: 'fa-key',
            statusClass: 'verify-step--ok',
            message: 'The cryptographic signature on this message is valid for sender '
              + (this.result && this.result.sender) + ' on ' + this.sigChain + '.'
          }
        case 'invalid':
          return {
            title: 'WARNING: signature does not match sender',
            icon: 'fa-exclamation-triangle',
            statusClass: 'verify-step--error',
            message: 'The signature failed verification against sender '
              + (this.result && this.result.sender)
              + '. This is a serious red flag.'
          }
        case 'missing':
          return {
            title: 'Message has no signature',
            icon: 'fa-exclamation-triangle',
            statusClass: 'verify-step--warn',
            message: this.sigError
          }
        case 'error':
          return {
            title: 'Could not verify signature',
            icon: 'fa-exclamation-triangle',
            statusClass: 'verify-step--error',
            message: this.sigError
          }
      }
      return null
    }
  },
  watch: {
    hash: {
      immediate: true,
      handler(newHash) {
        if (newHash) {
          this.query = newHash
          this.run()
        }
      }
    }
  },
  beforeDestroy() {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer)
  },
  methods: {
    submit() {
      const hash = (this.query || '').trim()
      if (!hash) return
      if (this.$route.params.hash !== hash) {
        // Sync the URL so the verification result is shareable.
        // The hash-prop watcher above will pick it up and re-run.
        this.$router.replace({ name: 'verify', params: { hash } })
      } else {
        // Same hash already in the URL; re-run explicitly.
        this.run()
      }
    },
    async copyLink() {
      try {
        await navigator.clipboard.writeText(window.location.href)
        this.copied = true
        if (this.copyResetTimer) clearTimeout(this.copyResetTimer)
        this.copyResetTimer = setTimeout(() => { this.copied = false }, 2000)
      } catch (e) {
        // Fallback for browsers without Clipboard API; users can still
        // copy from the URL bar.
        this.copied = false
      }
    },
    async run() {
      const hash = (this.query || '').trim()
      if (!hash) return
      this.loading = true
      this.result = null
      this.error = null
      this.chainLoading = false
      this.chainError = null
      this.txInput = null
      this.cid = null
      this.payloadLoading = false
      this.payloadError = null
      this.payload = null
      this.payloadSerialized = ''
      this.payloadContainsHash = null
      this.sigStatus = null
      this.sigChain = null
      this.sigError = null
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
        return
      } finally {
        this.loading = false
      }

      // Cryptographic check: signature ↔ sender. Lazy-loads the
      // chain-specific verifier from @aleph-sdk via src/lib/signature.js.
      this.verifySignature(this.result)

      const ethConf = this.result.confirmations
        && this.result.confirmations.find(c => c.chain === 'ETH')
      if (ethConf && ethConf.hash) {
        this.resolveAnchor(ethConf.hash)
      }
    },
    async verifySignature(msg) {
      this.sigStatus = null
      this.sigChain = null
      this.sigError = null
      const result = await verifyMessageSignature(msg)
      if (!result.supported) {
        // Unknown / unsupported chain — leave the signature block hidden.
        return
      }
      this.sigChain = result.chain
      if (result.missing) {
        this.sigStatus = 'missing'
        this.sigError = result.error
      } else if (result.error) {
        this.sigStatus = 'error'
        this.sigError = result.error
      } else {
        this.sigStatus = result.valid ? 'valid' : 'invalid'
      }
    },
    async resolveAnchor(txHash) {
      this.chainLoading = true
      this.chainError = null
      // Aleph confirmations report the tx hash without the 0x prefix;
      // ethereum-rpc.publicnode.com rejects unprefixed hashes.
      const normalizedHash = txHash.startsWith('0x') ? txHash : '0x' + txHash
      try {
        const { data } = await axios.post(ETH_RPC, {
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [normalizedHash],
          id: 1
        })
        if (data.error) {
          this.chainError = 'RPC error: ' + (data.error.message || JSON.stringify(data.error))
          return
        }
        const tx = data.result
        if (!tx || !tx.input) {
          this.chainError = 'Transaction not found or has no input data.'
          return
        }
        this.txInput = tx.input
        let payload
        try {
          payload = JSON.parse(decodeAnchorString(tx.input))
        } catch (e) {
          this.chainError = 'Anchor tx input is not a valid ABI-encoded JSON payload: '
            + (e.message || e)
          return
        }
        if (!payload || !payload.content) {
          this.chainError = 'Anchor payload has no "content" field (expected the IPFS CID).'
          return
        }
        this.cid = payload.content
      } catch (err) {
        this.chainError = 'Could not reach the Ethereum RPC. ' + (err.message || '')
        return
      } finally {
        this.chainLoading = false
      }

      if (this.cid && this.result && this.result.item_hash) {
        this.resolvePayload(this.cid, this.result.item_hash)
      }
    },
    async resolvePayload(cid, targetHash) {
      this.payloadLoading = true
      this.payloadError = null
      this.payload = null
      this.payloadSerialized = ''
      this.payloadContainsHash = null
      this.payloadGateway = null
      try {
        const attempts = IPFS_FALLBACK_GATEWAYS.map(gateway =>
          axios.get(gateway + cid, {
            responseType: 'json',
            timeout: IPFS_TIMEOUT_MS
          }).then(response => ({ data: response.data, gateway }))
        )
        // Promise.any resolves with the first fulfilled attempt and
        // throws AggregateError when every gateway fails.
        const { data, gateway } = await Promise.any(attempts)
        this.payload = data
        this.payloadGateway = gateway
        this.payloadSerialized = typeof data === 'string' ? data : JSON.stringify(data)
        this.payloadContainsHash = this.payloadSerialized.includes(targetHash)
      } catch (err) {
        if (err && err.name === 'AggregateError') {
          this.payloadError = 'All IPFS gateways failed: '
            + IPFS_FALLBACK_GATEWAYS.length + ' tried, none responded in time.'
        } else {
          this.payloadError = 'Could not fetch the IPFS payload. ' + (err.message || '')
        }
      } finally {
        this.payloadLoading = false
      }
    },
    buildSnippet(target) {
      if (!this.payloadSerialized || !target) return null
      const idx = this.payloadSerialized.indexOf(target)
      if (idx === -1) return null
      const start = Math.max(0, idx - SNIPPET_CONTEXT)
      const end = Math.min(this.payloadSerialized.length, idx + target.length + SNIPPET_CONTEXT)
      return {
        before: (start > 0 ? '…' : '') + this.payloadSerialized.slice(start, idx),
        match: target,
        after: this.payloadSerialized.slice(idx + target.length, end) +
          (end < this.payloadSerialized.length ? '…' : '')
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

.verify-form-row {
  gap: 0.75rem;
}

.verify-form-input {
  flex: 1 1 320px;
  min-width: 0;
}

.verify-copy-btn {
  flex: 0 0 auto;
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

.verify-gateway {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
}

.verify-gateway code {
  background: rgba(81, 0, 205, 0.06);
  color: #2b1865;
  padding: 0.05em 0.3em;
  border-radius: 0.2em;
}

.verify-snippet {
  margin-top: 0.75rem;
}

.verify-snippet__label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.verify-snippet pre {
  background: #f7f5fb;
  border: 1px solid rgba(81, 0, 205, 0.1);
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.78rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  color: #2b1865;
}

.verify-snippet mark {
  background: #d4ff00;
  color: #2b1865;
  padding: 0 0.15em;
  font-weight: 700;
  border-radius: 0.15em;
}

.verify-payload {
  margin-top: 0.75rem;
  font-size: 0.85rem;
}

.verify-payload summary {
  cursor: pointer;
  color: #5100cd;
  font-weight: 500;
  padding: 0.25rem 0;
  user-select: none;
}

.verify-payload summary:hover {
  text-decoration: underline;
}
</style>
