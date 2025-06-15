<template>
  <div class="home-view">
    <!-- This view is now minimal as the main layout is handled by DashboardView -->
    <!-- Any home-specific content can be added here -->
    <div class="home-content">
      <!-- Home specific widgets or content can go here -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HomeView',
  computed: {
    ...mapGetters('device', ['isConnected', 'deviceInfo', 'battery']),
    ...mapGetters('settings', ['dpiSettings', 'pollingRate', 'rgbSettings', 'sensorSettings'])
  },
  
  mounted() {
    // Redirect if not connected
    if (!this.isConnected) {
      this.$router.push('/initialize')
    }
  }
}
</script>

<style lang="scss" scoped>
.home-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-content {
  // Any home-specific styling can go here
  // The main layout is now handled by DashboardView
}
</style> 