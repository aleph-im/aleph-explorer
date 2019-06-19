<template>
  <b-table responsive :striped="striped" :hover="hover" :table-class="tableClass"
  :items="messages" :fields="messages_fields" :busy.sync="!messages.length">
      <template slot="item_hash" slot-scope="data">
        <b-link>{{data.item.item_hash}}</b-link>
      </template>
      <template slot="time" slot-scope="data">
        {{dateformat(data.item.time)}}
      </template>
  </b-table>
</template>

<script>
import moment from 'moment';
export default {
  name: 'MessageList',
  props: {
    messages: Array,
    tableClass: String,
    striped: Boolean,
    hover: Boolean
  },
  data() {
    return {
      messages_fields: [
        { key: 'item_hash', label: 'Item Hash', class: 'hash'},
        { key: 'type', label: 'Type' },
        { key: 'time', label: 'Time' }
      ]
    }
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
