<template>
  <div class="initialize-container">
    <!-- Background -->
    <div class="background-pattern"></div>
    
    <!-- Main content -->
    <div class="initialize-content">
      <!-- Header with back button -->
      <div class="header">
        <el-button 
          @click="initializeLogic.goBack" 
          type="text" 
          class="back-button"
          icon="el-icon-arrow-left"
        >
        </el-button>
        
        <!-- Kreo Logo -->
        <div class="logo-container">
          <img src="/logos/kreo-logo.svg" alt="Kreo" class="logo" />
        </div>
        
        <div class="spacer"></div>
      </div>
      
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1 class="welcome-title">
          Welcome to <span class="gradient-text">kreo.</span> hub
        </h1>
        <p class="welcome-subtitle">Your personal command center</p>
      </div>
      
      <!-- Initialize Button -->
      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          :loading="initializeLogic.initializing()"
          @click="initializeLogic.handleInitialize"
          class="initialize-button gradient-bg glow-effect"
        >
          {{ initializeLogic.initializing() ? 'Initializing...' : 'Initialize' }}
        </el-button>
      </div>
      
      <!-- Browser Support Info -->
      <div class="browser-info">
        <p class="browser-text">Currently supports Google Chrome, MS Edge and Opera</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createInitializeComposable } from '@/scripts/device/initialize'

export default {
  name: 'InitializeView',
  data() {
    return {
      initializeLogic: null
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected'])
  },
  created() {
    this.initializeLogic = createInitializeComposable(this.$store, this.$router, this.$message)
  },
  
  mounted() {
    if (this.isConnected) {
      this.$router.replace('/dashboard/home')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/pages/initialize.scss';
</style> 