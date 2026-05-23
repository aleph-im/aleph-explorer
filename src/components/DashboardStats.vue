<template>
  <b-row class="dashboard-stats">
    <b-col cols="12" md="4">
      <div class="stat-card">
        <div class="stat-label">Total messages</div>
        <div class="stat-value">{{ totalMessages }}</div>
        <div class="stat-sub stat-sub-highlight">
          <i class="fas fa-database"></i>
          <strong>{{ totalFiles }}</strong> files stored
        </div>
      </div>
    </b-col>

    <b-col cols="12" md="4">
      <div class="stat-card">
        <div class="stat-label">Pending messages</div>
        <div class="stat-value" :class="{ 'stat-warn': pendingCount > 100 }">{{ pendingCount }}</div>
        <div class="stat-sub stat-sub-highlight">
          <i class="fas fa-network-wired"></i>
          <strong>{{ peersTotal }}</strong> peers
        </div>
      </div>
    </b-col>

    <b-col cols="12" md="4">
      <div class="stat-card">
        <div class="stat-label">Last on-chain commit</div>
        <div class="stat-value">
          <a v-if="lastBlock" :href="contractUrl" target="_blank" rel="noopener noreferrer">
            block #{{ lastBlock }} <i class="fas fa-external-link-alt fa-xs"></i>
          </a>
          <span v-else>—</span>
        </div>
        <div class="stat-sub" v-if="lastBlock">
          {{ commitAgoText }}
        </div>
      </div>
    </b-col>

    <b-col cols="12" md="4">
      <div class="stat-card">
        <div class="stat-label">Users on Aleph</div>
        <div class="stat-value">{{ totalAccounts }}</div>
        <div class="stat-sub">
          <i class="fas fa-users"></i>
          publishing messages, files &amp; cloud resources
        </div>
      </div>
    </b-col>

    <b-col cols="12" md="4">
      <div class="stat-card">
        <div class="stat-label">Message rate</div>
        <div class="stat-value">{{ rateH1 }}<span class="stat-unit">/h</span></div>
        <div class="stat-sub">{{ rateH24 }} in the last 24h</div>
      </div>
    </b-col>

    <b-col cols="12" md="4">
      <div class="stat-card">
        <div class="stat-label">Next on-chain commit in</div>
        <div class="stat-value">{{ countdownText }}</div>
        <div class="stat-sub">≈1h commit cadence</div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from 'vuex'

const COMMIT_CADENCE_MS = 3600 * 1000
const ALEPH_ETH_CONTRACT = '0x166fd4299364b21c7567e163d85d78d2fb2f8ad5'

const fmt = (n) => {
  if (n === null || n === undefined) return '—'
  return Number(n).toLocaleString('en-US')
}

const fmtDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default {
  name: 'DashboardStats',
  data() {
    return {
      now: Date.now(),
      tickTimer: null
    }
  },
  computed: {
    ...mapState({
      metrics: state => state.metrics,
      eth_block_observed_at: state => state.eth_block_observed_at,
      eth_block_committed_at: state => state.eth_block_committed_at,
      message_rates: state => state.message_rates,
      addresses_pagination: state => state.addresses_pagination
    }),
    totalMessages() {
      return fmt(this.metrics?.pyaleph_status_sync_messages_total)
    },
    totalFiles() {
      return fmt(this.metrics?.pyaleph_status_sync_permanent_files_total)
    },
    pendingCount() {
      return fmt(this.metrics?.pyaleph_status_sync_pending_messages_total)
    },
    peersTotal() {
      return fmt(this.metrics?.pyaleph_status_peers_total)
    },
    lastBlock() {
      return this.metrics?.pyaleph_status_chain_eth_last_committed_height ?? null
    },
    contractUrl() {
      return `https://etherscan.io/address/${ALEPH_ETH_CONTRACT}`
    },
    commitAnchor() {
      // Prefer the real block timestamp from the ETH RPC; fall back to the
      // moment we first observed the new height (within metrics-poll resolution).
      return this.eth_block_committed_at || this.eth_block_observed_at
    },
    commitAgoText() {
      if (!this.commitAnchor) return ''
      const elapsed = Math.max(0, this.now - this.commitAnchor)
      return `${fmtDuration(elapsed)} ago`
    },
    totalAccounts() {
      return fmt(this.addresses_pagination?.total)
    },
    rateH1() {
      return fmt(this.message_rates?.h1)
    },
    rateH24() {
      return fmt(this.message_rates?.h24)
    },
    countdownText() {
      if (!this.commitAnchor) return '—'
      const target = this.commitAnchor + COMMIT_CADENCE_MS
      const remaining = target - this.now
      return remaining > 0 ? fmtDuration(remaining) : 'overdue'
    }
  },
  mounted() {
    this.tickTimer = setInterval(() => { this.now = Date.now() }, 200)
  },
  beforeDestroy() {
    if (this.tickTimer) clearInterval(this.tickTimer)
  }
}
</script>

<style scoped>
.dashboard-stats {
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.1;
}

.stat-unit {
  font-size: 0.85rem;
  font-weight: 400;
  color: #6c757d;
}

.stat-sub {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  min-height: 1em;
}

.stat-sub .fas {
  margin-right: 0.35rem;
  opacity: 0.7;
}

.stat-sub-highlight {
  font-size: 0.95rem;
  color: #5100cd;
  font-weight: 500;
  margin-top: 0.4rem;
}

.stat-sub-highlight strong {
  font-weight: 700;
}

.stat-sub-highlight .fas {
  margin-right: 0.35rem;
  opacity: 0.85;
}

.stat-warn {
  color: #d9245a;
}
</style>
