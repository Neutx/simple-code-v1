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
  },

  methods: {
    startRealTimeMonitoring() {
      // Update device info reference every 500ms for real-time updates
      this.realTimeTimer = setInterval(() => {
        if (HIDHandle.deviceInfo.deviceOpen) {
          // Force reactive update by creating a new reference
          this.deviceInfo = { ...HIDHandle.deviceInfo }
        }
      }, 500)
    },
    batteryLevel() {
      // Use real battery level from HIDHandle device info
      if (this.deviceInfo && this.deviceInfo.battery) {
        return this.deviceInfo.battery.level
      }
      return 0
    },
    logDeviceStatus() {
      const status = {
        timestamp: new Date().toISOString(),
        model: this.deviceModel,
        dpi: this.currentDPI,
        pollingRate: this.pollingRate + 'Hz',
        battery: this.batteryLevel + '%',
        lod: this.liftOffDistance,
        motionSync: this.motionSync ? 'ON' : 'OFF',
        online: this.deviceInfo.online ? 'CONNECTED' : 'OFFLINE',
        connectState: this.deviceInfo.connectState
      }
      
      console.log('📊 REAL-TIME DEVICE STATUS:', status)
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