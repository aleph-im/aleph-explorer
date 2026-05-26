<template>
  <div>
    <div class="section-header">
      <h1>The Aleph&nbsp;Cloud ecosystem</h1>
    </div>
    <div class="section-body">
      <p class="ecosystem-lead">
        The explorer you're looking at is one slice of a much bigger network.
        <br />
        Below is the rest of what the Aleph&nbsp;Cloud teams ship; pick a card to jump in.
      </p>

      <b-card no-body class="ecosystem-redundancy mb-4">
        <b-card-body>
          <div class="d-flex align-items-center flex-wrap">
            <i class="fas fa-shield-alt ecosystem-redundancy__icon"></i>
            <div class="ml-3 flex-grow-1">
              <div class="ecosystem-redundancy__label">Storage redundancy</div>
              <p class="ecosystem-redundancy__text mb-0">
                Every file pinned on Aleph is replicated across
                <a href="https://app.aleph.cloud/account/earn/ccn/" target="_blank"
                  rel="noopener" class="ecosystem-redundancy__link"
                  title="See the live list of Core Channel Nodes">
                  <strong>{{ ccnCount }} Core&nbsp;Channel Nodes</strong>
                  <i class="fas fa-external-link-alt fa-xs"></i>
                </a>
                worldwide. No single node, region or operator can take your data offline.
              </p>
            </div>
          </div>
        </b-card-body>
      </b-card>

      <div v-for="group in groups" :key="group.key" class="ecosystem-group">
        <h3 class="ecosystem-group__title">{{ group.title }}</h3>
        <b-row>
          <b-col v-for="item in group.items" :key="item.name" cols="12" md="6" lg="4" class="mb-3">
            <b-card no-body class="ecosystem-card h-100">
              <b-card-body class="d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                  <span class="ecosystem-card__icon"><i :class="item.icon"></i></span>
                  <div class="ml-3">
                    <div class="ecosystem-card__name">{{ item.name }}</div>
                    <div class="ecosystem-card__tagline">{{ item.tagline }}</div>
                  </div>
                </div>
                <p class="ecosystem-card__description">{{ item.description }}</p>
                <a :href="item.url" target="_blank" :rel="relFor(item.url)"
                  class="btn btn-primary btn-sm mt-auto align-self-start">
                  Open <i class="fas fa-external-link-alt fa-xs ml-1"></i>
                </a>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ECOSYSTEM_GROUPS } from '@/lib/ecosystem.js'
import { relFor } from '@/lib/links.js'

export default {
  name: 'ecosystem',
  metaInfo: {
    title: 'Ecosystem',
    meta: [
      { vmid: 'description', name: 'description',
        content: 'The Aleph Cloud ecosystem: Cloud Console, Network overview, ALEPH bridge, LibertAI and LiberClaw, plus storage-redundancy stats from the corechannel aggregate.' }
    ]
  },
  data() {
    return {
      groups: ECOSYSTEM_GROUPS
    }
  },
  methods: {
    relFor
  },
  computed: {
    ...mapState({
      network: state => state.network
    }),
    ccnCount() {
      const n = this.network && this.network.ccn_count
      return n != null ? Number(n).toLocaleString('en-US') : '—'
    }
  },
  created() {
    // Same data source as the dashboard card; safe to dispatch even if the
    // user lands directly here (action no-ops cheaply when in flight).
    if (!this.network || this.network.ccn_count == null) {
      this.$store.dispatch('load_network_size')
    }
  }
}
</script>

<style scoped>
.ecosystem-lead {
  font-size: 1.35rem;
  font-weight: 400;
  line-height: 1.4;
  color: #2b1865;
  margin-bottom: 2rem;
  max-width: 50em;
}

.ecosystem-redundancy {
  border: 1px solid rgba(81, 0, 205, 0.15);
  background: linear-gradient(135deg, rgba(81, 0, 205, 0.04), rgba(212, 255, 0, 0.05));
}

.ecosystem-redundancy__icon {
  font-size: 2rem;
  color: #5100cd;
  flex: 0 0 auto;
}

.ecosystem-redundancy__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6c757d;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.ecosystem-redundancy__text {
  color: #2b1865;
  font-size: 1rem;
  line-height: 1.4;
}

.ecosystem-redundancy__text strong {
  color: #5100cd;
  font-weight: 700;
}

.ecosystem-redundancy__link {
  color: #5100cd;
  text-decoration: none;
  white-space: nowrap;
}

.ecosystem-redundancy__link:hover {
  text-decoration: underline;
}

.ecosystem-redundancy__link .fa-external-link-alt {
  margin-left: 0.2em;
  opacity: 0.6;
}

.ecosystem-group {
  margin-bottom: 1.5rem;
}

.ecosystem-group__title {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #5100cd;
  margin-bottom: 0.75rem;
}

.ecosystem-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s, transform 0.15s;
}

.ecosystem-card:hover {
  box-shadow: 0 6px 18px rgba(81, 0, 205, 0.08);
  transform: translateY(-1px);
}

.ecosystem-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: rgba(81, 0, 205, 0.08);
  color: #5100cd;
  font-size: 1.1rem;
  flex: 0 0 auto;
}

.ecosystem-card__name {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.1;
}

.ecosystem-card__tagline {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.15rem;
}

.ecosystem-card__description {
  font-size: 0.85rem;
  color: #495057;
  margin-bottom: 1rem;
  flex-grow: 1;
}


</style>
