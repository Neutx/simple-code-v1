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
import HIDHandle from '@/assets/js/HIDHandle'

export default {
  name: 'HomeView',
  data() {
    return {
      realTimeTimer: null,
      silentMonitoringTimer: null
    }
  },
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

  beforeDestroy() {
    this.stopRealTimeMonitoring();
    this.stopRealTimeMonitoringWithoutLogging();
  },

  methods: {
    stopRealTimeMonitoring() {
      if (this.realTimeTimer) {
        clearInterval(this.realTimeTimer);
        this.realTimeTimer = null;
      }
    },
    startRealTimeMonitoring() {
      this.stopRealTimeMonitoring();
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
    stopRealTimeMonitoringWithoutLogging() {
      if (this.silentMonitoringTimer) {
        clearInterval(this.silentMonitoringTimer)
        this.silentMonitoringTimer = null
      }
    },
    // Real-time status monitoring
    startRealTimeMonitoringWithoutLogging() {
      this.stopRealTimeMonitoringWithoutLogging()
      this.silentMonitoringTimer = setInterval(() => {
        if (HIDHandle.deviceInfo.deviceOpen && HIDHandle.deviceInfo.connectState === 2) {
          // Monitor device status without logging
        }
      }, 1000);
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