<template>
  <div class="dashboard-container">
    <!-- Top Section with all elements in one row -->
    <div class="dashboard-header">
      <!-- Back Button -->
      <div class="header-left">
        <BackButton @click="handleBack" />
      </div>
      
      <!-- Kreo Logo and Navigation Tabs -->
      <div class="header-main">
        <KreoLogo />
        <NavigationTabs @tab-selected="handleTabChange" />
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
      <!-- DPI Top Bar -->
      <DPITopBar 
        :is-visible="isDPIMode" 
        @dpi-selected="handleDPISelected"
      />
      
      <!-- Mouse Visualization -->
      <div class="mouse-section">
        <MouseVisualization 
          :src="mouseImageSrc" 
          :is-dpi-mode="isDPIMode"
        />
      </div>
      
      <!-- Router View for Tab Content -->
      <div class="content-overlay">
        <!-- <router-view /> -->
      </div>
    </div>

    <!-- DPI Settings Panel -->
    <DPISettings :is-visible="isDPIMode" />

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

import MouseVisualization from '@/components/dashboard/MouseVisualization.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import BackButton from '@/components/dashboard/BackButton.vue'
import KreoLogo from '@/components/dashboard/KreoLogo.vue'
import StatusBar from '@/components/dashboard/StatusBar.vue'
import DPISettings from '@/components/dashboard/DPISettings.vue'
import DPITopBar from '@/components/dashboard/DPITopBar.vue'

export default {
  name: 'DashboardView',
  components: {
    NavigationTabs,
    MouseVisualization,
    ActionButtons,
    BackButton,
    KreoLogo,
    StatusBar,
    DPISettings,
    DPITopBar
  },
  data() {
    return {
      isDPIMode: false
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected', 'deviceInfo', 'battery']),
    ...mapGetters('settings', ['dpiSettings', 'pollingRate', 'rgbSettings', 'sensorSettings']),
    
    deviceModel() {
      // If no device info, return default
      if (!this.deviceInfo) return 'Ikarus'
      
      // Check if we have the nested info structure from HIDHandle
      if (this.deviceInfo.info && this.deviceInfo.info.cid && this.deviceInfo.info.mid) {
        return this.getDeviceNameFromCidMid(this.deviceInfo.info.cid, this.deviceInfo.info.mid)
      }
      
      // Fallback for direct cid/mid properties (if structure changes)
      if (this.deviceInfo.cid && this.deviceInfo.mid) {
        return this.getDeviceNameFromCidMid(this.deviceInfo.cid, this.deviceInfo.mid)
      }
      
      return 'Unknown'
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
    // Redirect to initialize if not connected and not already on the initialize page
    if (!this.isConnected && this.$route.path !== '/initialize') {
      this.$router.push('/initialize');
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
    },
    
    getDeviceNameFromCidMid() {
     console.log(this.deviceInfo)
     console.log(this.deviceInfo.info)
     console.log(this.deviceInfo.info.cid)
     console.log(this.deviceInfo.info.mid)
    },
    
    handleTabChange(tab) {
      // Handle tab change logic
      console.log('Tab changed to:', tab)
      
      // Activate DPI mode when DPI tab is selected
      this.isDPIMode = (tab === 'dpi')
    },
    
    handleDPISelected(dpi) {
      // Handle DPI selected logic
      console.log('DPI selected:', dpi)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  background: black;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  overflow: hidden;
}

.dashboard-header,
.dashboard-main-content,
.dashboard-footer {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}

.dashboard-header {
  align-self: start; /* Aligns header to the top of the grid area */
  display: flex;
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100%;
  padding: 4.5vh 3vw 0 3vw;
  z-index: 10;
  justify-content: space-between;
  align-items: center;
  gap: 44px;
  margin-bottom: 0; /* Remove margin */
  min-height: auto; /* Remove min-height */
}

.header-left {
  flex: 0 1 auto; /* Allow shrinking, don't grow */
}

.header-main {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2vw;
  min-width: 0;
}

.header-right {
  flex: 0 1 auto;
}

.dashboard-main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1; /* Sits below the header and footer */
}

.mouse-section {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  /* Sizing is now handled by the child component */
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
  align-self: end; /* Aligns footer to the bottom of the grid area */
  width: 100%;
  padding: 0 12vw;
  padding-bottom: 15vh; /* Use viewport height for responsive padding */
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

// Responsive breakpoints
@media (max-width: 1200px) {
  .dashboard-header {
    padding: 3vh 2vw 0 2vw;
    gap: 44px;
  }
  .header-main {
    gap: 1.5vw;
  }
}

@media (max-width: 1024px) {
  .dashboard-header {
    flex-direction: column;
    padding: 2vh 2vw;
    gap: 1vh;
  }
  .header-main {
    flex-direction: column;
    gap: 2vh;
    order: -1; /* Move logo/nav to the top on mobile */
  }
  .header-left, .header-right {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 2vh 3vw;
  }
}
</style> 