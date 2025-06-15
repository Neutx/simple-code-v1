<template>
  <div class="dashboard-container">
    <!-- Top Section with all elements in one row -->
    <div class="dashboard-header">
      <!-- Back Button -->
      <div class="header-left">
        <BackButton @back="handleBack" />
      </div>
      
      <!-- Kreo Logo -->
      <div class="header-logo">
        <KreoLogo :logo-src="'/logos/kreo-logo.svg'" />
      </div>
      
      <!-- Navigation Tabs - Centered -->
      <div class="header-center">
        <NavigationTabs :current-path="$route.path" />
      </div>
      
      <!-- Action Buttons -->
      <div class="header-right">
        <ActionButtons 
          @calibrate="handleCalibrate"
          @settings="handleSettings"
          @profile="handleProfile"
        />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="dashboard-main">
      <!-- Mouse Visualization -->
      <div class="mouse-section">
        <MouseVisualization 
          :device-model="deviceModel"
          :mouse-image="mouseImageSrc"
        />
      </div>
      
      <!-- Router View for Tab Content -->
      <div class="content-overlay">
        <router-view />
      </div>
    </div>

    <!-- Status Bar -->
    <div class="dashboard-footer">
      <StatusBar 
        :device-model="deviceModel"
        :current-d-p-i="currentDPI"
        :polling-rate="pollingRate"
        :battery-level="batteryLevel"
        :lift-off-distance="liftOffDistance"
        :motion-sync="motionSync"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NavigationTabs from '@/components/dashboard/NavigationTabs.vue'
import StatusBar from '@/components/dashboard/StatusBar.vue'
import MouseVisualization from '@/components/dashboard/MouseVisualization.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import BackButton from '@/components/dashboard/BackButton.vue'
import KreoLogo from '@/components/dashboard/KreoLogo.vue'

export default {
  name: 'DashboardView',
  components: {
    NavigationTabs,
    StatusBar,
    MouseVisualization,
    ActionButtons,
    BackButton,
    KreoLogo
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected', 'deviceInfo', 'battery']),
    ...mapGetters('settings', ['dpiSettings', 'pollingRate', 'rgbSettings', 'sensorSettings']),
    
    deviceModel() {
      if (!this.deviceInfo) return 'Ikarus'
      return `${this.deviceInfo.cid}_${this.deviceInfo.mid}` || 'Ikarus'
    },
    
    currentDPI() {
      if (!this.dpiSettings?.stages?.length) return '420'
      return this.dpiSettings.stages[this.dpiSettings.current] || '420'
    },
    
    batteryLevel() {
      return this.battery?.level || 69
    },
    
    liftOffDistance() {
      return this.sensorSettings?.liftOffDistance || '1MM'
    },
    
    motionSync() {
      return this.sensorSettings?.motionSync || true
    },
    
    mouseImageSrc() {
      return '/mice/ikarus.svg'
    }
  },
  
  mounted() {
    // Redirect to initialize if not connected
    if (!this.isConnected) {
      this.$router.push('/initialize')
    }
  },
  
  methods: {
    handleBack() {
      this.$router.push('/initialize')
    },
    
    handleCalibrate() {
      // Add calibration logic
      this.$message.info('Calibration feature coming soon!')
    },
    
    handleSettings() {
      // Add settings logic
      this.$message.info('Settings feature coming soon!')
    },
    
    handleProfile() {
      // Add profile logic
      this.$message.info('Profile feature coming soon!')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100vw;
  height: 100vh;
  background: black;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 82px 48px 0 48px;
  z-index: 10;
  margin-bottom: 40px;
}

.header-left {
  flex: 0 0 auto;
}

.header-logo {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-start;
  margin-left: 50px;
  padding-top: 10px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding-top: 10px;
  margin-left: -80px;
}

.header-right {
  flex: 0 0 auto;
}

.dashboard-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.mouse-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.content-overlay {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-footer {
  padding: 0 319px 63px 319px;
  position: relative;
  z-index: 10;
}

// Responsive adjustments
@media (max-width: 1920px) {
  .dashboard-header {
    padding: 70px 48px 0 48px;
  }
  
  .header-logo {
    margin-left: 60px;
  }
  
  .dashboard-footer {
    padding: 0 200px 40px 200px;
  }
}

@media (max-width: 1440px) {
  .dashboard-header {
    padding: 70px 48px 0 48px;
  }
  
  .header-logo {
    margin-left: 40px;
  }
  
  .dashboard-footer {
    padding: 0 100px 30px 100px;
  }
}
</style> 