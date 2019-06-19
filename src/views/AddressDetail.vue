<template>
  <div>
    <div class="section-header">
      <h1>Address detail</h1>
    </div>
    <div class="section-body">
      <h2 class="section-title">{{address}}</h2>
      <p class="section-lead">This page is just an example for you to create your own page.</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'address-detail',
  components: {
  },
  props: {
    address: String
  }
}
</script>
