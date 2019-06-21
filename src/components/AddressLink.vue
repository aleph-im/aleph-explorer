<template>
  <b-link class="address"
          :to="{name: 'address-detail', params: {
               address: this.address, chain: this.chain
               }}">
    {{this.address}}</b-link>
</template>

<script>
export default {
  name: 'address-link',
  props: {
    address: String,
    chain: String,
  }
}
</script>
