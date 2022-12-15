<template>
  <b-link :class="'hash '+this.className"
          :to="{name: 'message-detail', params: {
               address: this.address, chain: this.chain,
               hash: this.hash, type: this.type
               }}">
    {{this.hash}}</b-link>
</template>

<script>
export default {
  name: 'message-link',
  props: {
    className: String,
    hash: String,
    chain: String,
    address: String,
    type: String
  }
}
</script>
