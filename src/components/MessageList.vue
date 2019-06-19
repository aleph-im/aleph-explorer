<template>
  <div>
    <b-list-group flush class="compact">
      <transition-group name="dynamic-list" tag="div">
        <b-list-group-item v-for="message of messages" :key="message.item_hash">
          <div class="d-flex w-100 font-small">
            <figure v-if="message.type==='POST'"
                    class="avatar avatar-sm mr-2 bg-primary text-white"
                    data-initial="Post"></figure>
            <figure v-if="message.type==='AGGREGATE'"
                    class="avatar avatar-sm mr-2 bg-info text-white"
                    data-initial="Aggr"></figure>
            <div>
              <b-link class="hash break-xs">{{message.item_hash}}</b-link><br />
              <span v-b-tooltip.hover :title="dateformat(message.time)">
                {{reldateformat(message.time)}}
              </span>
            </div>
            <div>
              By <b-link class="address break-xs">{{message.sender}}</b-link><br />
              <span v-if="message.content.address !== message.sender">
                For <b-link class="address break-xs">{{message.content.address}}</b-link>
              </span>
            </div>
            <div class="ml-auto" v-if="message.confirmations">
              <b-badge v-b-tooltip.hover :title="confirm_text(message)"
              variant="light">{{message.confirmations.length}}</b-badge>
            </div>
          </div>
        </b-list-group-item>
      </transition-group>
    </b-list-group>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'MessageList',
  props: {
    messages: Array
  },
  methods:{
    dateformat (dt) {
      return moment.unix(dt).format('lll')
    },
    reldateformat (dt) {
      return moment.unix(dt).fromNow()
    },
    confirm_text (message) {
      let chains = [...new Set(message.confirmations.map(c => c.chain))];
      return `${message.confirmations.length} confirmations:\n${chains.join(', ')}`;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.list-group-item {
  transition: all 1s;
}
.dynamic-list-enter, .dynamic-list-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(30px);
}
.dynamic-list-leave-to {
  transform: translateX(-30px);
}
.dynamic-list-leave-active {
  position: absolute;
}
</style>
