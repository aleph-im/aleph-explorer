<template>
  <figure :class="'avatar avatar-sm mr-2 text-white ' + this.iconStyle.background"
          :data-initial="this.iconStyle.text" />
</template>

<script>
const iconStyles = {
  POST: {
    background: 'bg-primary',
    text: 'Post'
  },
  AGGREGATE: {
    background: 'bg-info',
    text: 'Aggr'
  },
  STORE: {
    background: 'bg-dark',
    text: 'Store'
  },
  PROGRAM: {
    background: 'warning',
    text: 'VM'
  },
  FORGET: {
    background: 'bg-secondary',
    text: 'F'
  },
  __unknown: {
    background: 'bg-white',
    text: ''
  }
}

export default {
  name: 'MessageIcon',
  props: {
    messageType: String
  },
  computed: {
    iconStyle () {
      if(iconStyles.hasOwnProperty(this.messageType)){
        return iconStyles[this.messageType]
      }

      return iconStyles.__unknown
    }
  }
}
</script>
