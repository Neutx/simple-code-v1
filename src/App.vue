<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'App',
  async created() {
    this.loadLocalSettings()
  },
  methods: {
    ...mapActions('settings', ['loadLocalSettings'])
  }
}
</script>

<style>
/* All styles are now imported via global.scss */
</style>
