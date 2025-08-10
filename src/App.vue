<template>
  <div id="app">
    <div v-if="!authInitialized" class="auth-loading">
      <LoadingSpinner />
      <p>Initializing...</p>
    </div>
    <router-view v-else />
    <OSDetector />
    <BetaLogo />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import BetaLogo from '@/components/BetaLogo.vue'
import OSDetector from '@/components/OSDetector.vue'

export default {
  name: 'App',
  components: {
    LoadingSpinner,
    BetaLogo,
    OSDetector
  },
  computed: {
    ...mapGetters('auth', {
      authInitialized: 'initialized'
    })
  },
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

.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-loading p {
  margin-top: 1rem;
  color: #666;
  font-size: 14px;
}
</style>
