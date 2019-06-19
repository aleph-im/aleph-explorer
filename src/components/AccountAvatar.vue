<template>
  <router-link v-bind:to="target" :class="linkclass">
      <figure :class="'avatar ' + avatarclass">
        <img :src="ipfs_gateway + profiles[address].profile_picture" alt="..." :class="imgclass"
             v-if="(profiles[address]) && (profiles[address].profile_picture)">
        <img :src="'https://robohash.org/' + address + '?set=set1&bgset=bg1'"
             alt="..."  :class="'avatar-img ' + imgclass" v-else>
        </figure>
    </router-link>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'account-avatar',
  props: ['address', 'avatarclass', 'linkclass', 'imgclass', 'profile'],
  computed: mapState({
    account: state => state.account,
    profiles: state => state.profiles,
    address_alias: state => state.address_alias,
    ipfs_gateway: state => state.ipfs_gateway,
    target(state) {
      return { name: 'address-detail', params: {'address': this.address} }
    }
  }),
  watch: {
    profiles() {
      this.$forceUpdate();
    },
    address_alias() {
      this.$forceUpdate();
    }
  }
}
</script>
