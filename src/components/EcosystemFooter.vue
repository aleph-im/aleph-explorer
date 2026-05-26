<template>
  <div class="ecosystem-footer">
    <b-container fluid>
      <b-row class="ecosystem-footer__legal">
        <b-col cols="12" md="8" class="ecosystem-footer__copy">
          Copyright © 2018-present
          <a href="https://aleph.cloud" target="_blank" rel="noopener noreferrer">Aleph Cloud</a>
          <template v-if="app_version">
            <span class="ecosystem-footer__version">
              <template v-if="last_release_is_a_tag()">
                <a :href="'https://github.com/aleph-im/aleph-explorer/tree/' + app_version"
                  target="_blank" rel="noopener noreferrer">{{ app_version }}</a>
              </template>
              <template v-else>{{ app_version }}</template>
            </span>
          </template>
        </b-col>
        <b-col cols="12" md="4" class="ecosystem-footer__github">
          <a href="https://github.com/aleph-im" target="_blank"
            rel="noopener noreferrer" title="Aleph on GitHub">
            <i class="fab fa-github"></i> aleph-im
          </a>
        </b-col>
      </b-row>
      <b-row class="mt-2 pt-3 ecosystem-footer__resources">
        <b-col cols="12" class="d-flex flex-wrap">
          <a v-for="link in resources" :key="link.name" :href="link.url" target="_blank"
            rel="noopener noreferrer" class="ecosystem-footer__resource" :title="link.name">
            <i :class="link.icon"></i> {{ link.name }}
          </a>
          <b-link to="/ecosystem" class="ecosystem-footer__resource ml-auto">
            See full ecosystem <i class="fas fa-chevron-right fa-xs"></i>
          </b-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { RESOURCE_LINKS } from '@/lib/ecosystem.js'

export default {
  name: 'EcosystemFooter',
  data() {
    return {
      resources: RESOURCE_LINKS,
      app_version: GIT_DESCRIBE_TAGS || 'unknown build'
    }
  },
  methods: {
    last_release_is_a_tag() {
      return /\d+-.[0-9A-F]{7}$/i.test(this.app_version)
    }
  }
}
</script>

<style scoped>
.ecosystem-footer {
  padding: 1.25rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafd;
}

.ecosystem-footer__resource {
  color: #6c757d;
  font-size: 0.8rem;
  margin-right: 1.25rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.ecosystem-footer__resource:hover {
  color: #5100cd;
}

.ecosystem-footer__resources {
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}

.ecosystem-footer__legal {
  font-size: 0.8rem;
  color: #6c757d;
}

.ecosystem-footer__copy a {
  color: #2b1865;
  text-decoration: none;
}

.ecosystem-footer__copy a:hover {
  color: #5100cd;
  text-decoration: underline;
}

.ecosystem-footer__version {
  margin-left: 0.4rem;
  opacity: 0.7;
}

.ecosystem-footer__github {
  text-align: right;
}

.ecosystem-footer__github a {
  color: #6c757d;
  text-decoration: none;
}

.ecosystem-footer__github a:hover {
  color: #5100cd;
}

@media (max-width: 767px) {
  .ecosystem-footer__github {
    text-align: left;
    margin-top: 0.5rem;
  }
}
</style>
