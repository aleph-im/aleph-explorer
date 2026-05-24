<template>
  <b-input-group class="dashboard-search">
    <b-form-input v-model="query" placeholder="Search by item hash or address (any chain)"
      @keyup.enter="submit" trim debounce="0" />
    <b-input-group-append>
      <b-button variant="primary" :disabled="!query" @click="submit">
        <i class="fas fa-search"></i> Search
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return { query: '' }
  },
  methods: {
    submit() {
      const value = (this.query || '').trim()
      if (!value) return
      if (/^[0-9a-fA-F]{64}$/.test(value)) {
        this.$router.push({ name: 'message-detail', params: { hash: value } })
      } else if (/^0x[0-9a-fA-F]{40}$/.test(value)) {
        this.$router.push({ name: 'address-detail', params: { chain: 'ETH', address: value } })
      } else {
        // Anything else, let the addresses search do substring matching.
        this.$router.push({ name: 'addresses', query: { q: value } })
      }
    }
  }
}
</script>

<style scoped>
.dashboard-search {
  margin-bottom: 1.5rem;
}
</style>
