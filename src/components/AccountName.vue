<template>
  <span>
    <router-link :to="target"
       v-if="(profiles[address]) && (profiles[address].name)"
       :class="linkclass ? linkclass : ''"
       >{{profiles[address].name}}</router-link>
    <router-link :to="target"
      :class="linkclass ? linkclass : ''"
       v-else>{{address}}</router-link>
  </span>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'account-name',
  props: ['address', 'linkclass'],
  computed: mapState({
    account: state => state.account,
    profiles: state => state.profiles,
    target(state) {
      return { name: 'address-detail', params: {'address': this.address} }
    }
  }),
  watch: {
    profiles() {
      this.$forceUpdate();
    }
  }
}
</script>
