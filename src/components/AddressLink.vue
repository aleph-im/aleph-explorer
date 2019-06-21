<template>
  <b-link :class="'address '+this.class"
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
    class: String
  }
}
</script>
