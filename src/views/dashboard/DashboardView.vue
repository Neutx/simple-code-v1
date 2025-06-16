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
        <NavigationTabs @tab-changed="handleTabChange" />
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
      <!-- Mouse Visualization - Regular Mode -->
      <div class="mouse-section" v-if="!isDPIMode">
        <MouseVisualization :src="mouseImageSrc" />
      </div>
      
      <!-- Animated Mouse for DPI Settings -->
      <div class="animated-mouse-section" v-if="activeTab === 'dpi'">
        <AnimatedMouseVisualization 
          :device-model="deviceModel"
          :mouse-image="mouseImageSrc"
          :is-d-p-i-mode="true"
        />
      </div>
      
      <!-- DPI Control Bar (only visible in DPI mode) -->
      <div class="dpi-control-section" v-if="activeTab === 'dpi'">
        <DPIControlBar 
          :active-d-p-i="activeDPI"
          @dpi-changed="handleDPIChange"
        />
      </div>
      
      <!-- DPI Settings Panel (only visible in DPI mode) -->
      <DPISettingsPanel v-if="activeTab === 'dpi'" />
      
      <!-- Router View for Tab Content -->
      <div class="content-overlay">
        <!-- <router-view /> -->
      </div>
    </div>

    <!-- Status Bar -->
    <div class="dashboard-footer" v-if="!isDPIMode">
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
import AnimatedMouseVisualization from '@/components/dashboard/AnimatedMouseVisualization.vue'
import DPIControlBar from '@/components/dashboard/DPIControlBar.vue'
import DPISettingsPanel from '@/components/dashboard/DPISettingsPanel.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import BackButton from '@/components/dashboard/BackButton.vue'
import KreoLogo from '@/components/dashboard/KreoLogo.vue'
import StatusBar from '@/components/dashboard/StatusBar.vue'

export default {
  name: 'DashboardView',
  components: {
    NavigationTabs,
    MouseVisualization,
    AnimatedMouseVisualization,
    DPIControlBar,
    DPISettingsPanel,
    ActionButtons,
    BackButton,
    KreoLogo,
    StatusBar
  },
  data() {
    return {
      activeTab: 'home',
      activeDPI: 1 // Default to second profile (1200 DPI)
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected', 'deviceInfo', 'battery']),
    ...mapGetters('settings', ['dpiSettings', 'pollingRate', 'rgbSettings', 'sensorSettings']),
    
    isDPIMode() {
      return this.activeTab === 'dpi'
    },
    
    deviceModel() {
      // If no device info, return default
      if (!this.deviceInfo) return 'Unknown'
      
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
      if (!this.dpiSettings || !this.dpiSettings.stages || !this.dpiSettings.stages.length) return '420'
      return this.dpiSettings.stages[this.dpiSettings.current] || '420'
    },
    
    batteryLevel() {
      return this.battery ? this.battery.level : 69
    },
    
    liftOffDistance() {
      return this.sensorSettings ? this.sensorSettings.liftOffDistance : '1MM'
    },
    
    motionSync() {
      return this.sensorSettings ? this.sensorSettings.motionSync : true
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
    handleTabChange(tabId) {
      this.activeTab = tabId
      console.log('Tab changed to:', tabId)
    },
    
    handleDPIChange(dpiIndex) {
      this.activeDPI = dpiIndex
      console.log('DPI changed to index:', dpiIndex)
      // Here you would typically update the store or send to device
    },
    
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

.animated-mouse-section {
  position: fixed;        /* Fixed to viewport so zoom doesn't shift it */
  top: 85%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  /* Sizing is now handled by the child component */
}

.dpi-control-section {
  position: fixed;        /* Fixed to viewport so zoom doesn't shift it */
  top: 20vh;              /* Distance from the top of the screen */
  left: calc(55% + 30vw); /* Shift it to the right of the centre */
  transform: translateX(-50%); /* Offset half of its own width */
  z-index: 15;
  pointer-events: none;
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