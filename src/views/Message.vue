<template>
  <div>
    <div class="section-header">
      <h1>Message detail</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">{{hash}}</h2>
      <p class="section-lead">This page is just an example for you to create your own page.</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'message',
  components: {
  },
  props: {
    hash: String
  }
}
</script>
