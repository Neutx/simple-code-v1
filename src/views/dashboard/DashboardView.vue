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
      <!-- Mouse Visualization - Regular Home -->
      <div class="mouse-section" v-if="activeTab === 'home'">
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
      
      <!-- Sensor Mouse Display -->
      <div class="sensor-mouse-section" v-if="activeTab === 'sensor'">
        <SensorMouseDisplay 
          ref="sensorMouseDisplay"
          :device-model="deviceModel" 
          :mouse-image-src="mouseImageSrc"
          :profileCount="4"
          :activeProfile="1"
          :currentDPI="currentDPI"
          :pollingRate="pollingRate"
          :batteryLevel="batteryLevel"
        />
      </div>
      
      <!-- Sensor Settings Panel (only visible in sensor mode) -->
      <SensorSettingsPanel v-if="activeTab === 'sensor'" />
      
      <!-- Key Remapping Mouse Display (only visible in keys mode) -->
      <div class="key-remapping-mouse-section" v-if="activeTab === 'keys'" :class="{ 'panel-expanded': isKeyRemappingPanelExpanded }">
        <KeyRemappingMouseDisplay 
          :device-model="deviceModel" 
          :mouse-image-src="mouseImageSrc"
          :highlighted-key="highlightedKey"
          @key-selected="handleKeySelected"
        />
      </div>
      
      <!-- Key Remapping Panel (only visible in keys mode) -->
      <KeyRemappingPanel v-if="activeTab === 'keys'" @key-mapping-updated="handleKeyMappingUpdate" @panel-state-changed="handlePanelStateChange" />
      
      <!-- RGB Mouse Display -->
      <div class="rgb-mouse-section" v-if="activeTab === 'rgb'">
        <SensorMouseDisplay 
          :device-model="deviceModel" 
          :mouse-image-src="mouseImageSrc"
          :profileCount="4"
          :activeProfile="1"
          :currentDPI="currentDPI"
          :pollingRate="pollingRate"
          :batteryLevel="batteryLevel"
        />
      </div>
      
      <!-- RGB Settings Panel (only visible in RGB mode) -->
      <RGBSettingsPanel v-if="activeTab === 'rgb'" />
      
      <!-- Router View for Tab Content -->
      <div class="content-overlay">
        <!-- <router-view /> -->
      </div>
    </div>

    <!-- Status Bar -->
    <div class="dashboard-footer" v-if="!isDPIMode && activeTab !== 'rgb' && activeTab !== 'sensor' && activeTab !== 'keys'">
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
import HIDHandle from '@/assets/js/HIDHandle'
import NavigationTabs from '@/components/dashboard/NavigationTabs.vue'
import MouseVisualization from '@/components/dashboard/MouseVisualization.vue'
import AnimatedMouseVisualization from '@/components/dashboard/AnimatedMouseVisualization.vue'
import DPIControlBar from '@/components/dashboard/DPIControlBar.vue'
import DPISettingsPanel from '@/components/dashboard/DPISettingsPanel.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import BackButton from '@/components/dashboard/BackButton.vue'
import KreoLogo from '@/components/dashboard/KreoLogo.vue'
import StatusBar from '@/components/dashboard/StatusBar.vue'
import SensorSettingsPanel from '@/components/dashboard/SensorSettingsPanel.vue'
import SensorMouseDisplay from '@/components/dashboard/SensorMouseDisplay.vue'
import RGBSettingsPanel from '@/components/dashboard/RGBSettingsPanel.vue'
import KeyRemappingPanel from '@/components/dashboard/KeyRemappingPanel.vue'
import KeyRemappingMouseDisplay from '@/components/dashboard/KeyRemappingMouseDisplay.vue'

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
    StatusBar,
    SensorSettingsPanel,
    SensorMouseDisplay,
    KeyRemappingPanel,
    KeyRemappingMouseDisplay,
    RGBSettingsPanel
  },
  data() {
    return {
      activeTab: 'home',
      activeDPI: 1, // Default to second profile (1200 DPI)
      deviceInfo: HIDHandle.deviceInfo, // Reactive reference to HIDHandle
      realTimeTimer: null,
      isKeyRemappingPanelExpanded: false,
      highlightedKey: null
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected']),
    ...mapGetters('settings', ['dpiSettings', 'rgbSettings', 'sensorSettings']),
    
    isDPIMode() {
      return this.activeTab === 'dpi'
    },
    
    deviceModel() {
      // Use reactive deviceInfo for device info
      if (this.deviceInfo.info && this.deviceInfo.info.cid && this.deviceInfo.info.mid) {
        return this.getDeviceNameFromCidMid(this.deviceInfo.info.cid, this.deviceInfo.info.mid)
      }
      return 'Ikarus' // Default mouse model
    },
    
    currentDPI() {
      // Use reactive deviceInfo for current DPI
      const dpiIndex = this.deviceInfo?.mouseCfg?.currentDpi;
      const dpiValue = this.deviceInfo?.mouseCfg?.dpis?.[dpiIndex]?.value;
      return dpiValue || 1600;
    },
    
    batteryLevel() {
      // Use reactive deviceInfo for battery level
      const level = this.deviceInfo?.battery?.level;
      return level || 0;
    },
    
    pollingRate() {
      // Use HIDHandle directly for polling rate with reactive deviceInfo
      const rate = this.deviceInfo?.mouseCfg?.reportRate;
      return rate || 1000;
    },
    
    liftOffDistance() {
      // Use reactive deviceInfo for LOD
      const lod = this.deviceInfo?.mouseCfg?.sensor?.lod;
      return lod ? `${lod}MM` : '1MM';
    },
    
    motionSync() {
      // Use reactive deviceInfo for motion sync
      const sync = this.deviceInfo?.mouseCfg?.sensor?.motionSync;
      return sync || false;
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

    // Initialize sensor settings from Vuex store
    this.$store.dispatch('settings/loadSettingsFromLocalStorage');
    
    // Start real-time monitoring for dashboard updates
    this.startRealTimeMonitoring();
    
    // Listen for direct sensor mouse display updates
    this.$bus.$on("updateSensorMouseDisplay", (data) => {
      this.updateSensorMouseDisplay(data.type, data.value)
    })
  },
  
  beforeDestroy() {
    // Clean up timer
    if (this.realTimeTimer) {
      clearInterval(this.realTimeTimer);
    }
    // Clean up event listener
    this.$bus.$off("updateSensorMouseDisplay")
  },
  
  watch: {
    // Watch for device connection changes
    isConnected(newVal) {
      if (!newVal) {
        this.$router.push('/initialize');
      }
    },
    
    // Watch HIDHandle deviceInfo for changes
    deviceInfo: {
      handler() {
        // Handle device info changes if needed
      },
      deep: true
    },
    
    // Watch specifically for polling rate changes
    'deviceInfo.mouseCfg.reportRate'() {
      // Force re-render by updating component key or triggering update
      this.$forceUpdate()
    }
  },
  
  methods: {
    startRealTimeMonitoring() {
      // Update dashboard every 500ms for real-time sync
      this.realTimeTimer = setInterval(() => {
        if (HIDHandle.deviceInfo.deviceOpen) {
          // Force reactive update by updating data property
          this.deviceInfo = { ...HIDHandle.deviceInfo };
        }
      }, 500);
    },
    
    handleTabChange(tabId) {
      this.activeTab = tabId
    },
    
    handleDPIChange(dpiIndex) {
      this.activeDPI = dpiIndex
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
    
    handleKeySelected() {
      // Handle key selection logic here
    },
    
    handleKeyMappingUpdate() {
      // Handle key mapping update logic here
    },

    handlePanelStateChange({ isExpanded, selectedKey }) {
      this.isKeyRemappingPanelExpanded = isExpanded;
      this.highlightedKey = selectedKey;
    },
    
    getDeviceNameFromCidMid(cid, mid) {
      // Map known device combinations to names
      const deviceMap = {
        '0_0': 'Unknown Device',
        // Add more mappings as needed based on your device IDs
      };
      
      const key = `${cid}_${mid}`;
      return deviceMap[key] || 'Ikarus'; // Default to Ikarus
    },
    
    // Method to directly update sensor mouse display
    updateSensorMouseDisplay(type, value) {
      if (this.$refs.sensorMouseDisplay) {
        if (type === 'pollingRate') {
          this.$refs.sensorMouseDisplay.updatePollingRate(value)
        } else if (type === 'dpi') {
          this.$refs.sensorMouseDisplay.updateDPI(value)
        }
      }
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

.sensor-mouse-section {
  position: absolute;
  top: 50%;
  left: calc(50% + 300px); /* Increased offset for more spacing from sensor panel */
  transform: translate(-50%, -50%);
  z-index: 1;
}

.rgb-mouse-section {
  position: absolute;
  top: 50%;
  left: calc(50% + 200px); /* Offset to account for RGB panel width */
  transform: translate(-50%, -50%);
  z-index: 1;
}

.key-remapping-mouse-section {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.panel-expanded {
    left: calc(50% + 15vw);
  }
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
  
  .key-remapping-mouse-section {
    right: 12vw;
    top: 52%;
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
  
  .key-remapping-mouse-section {
    right: 8vw;
    top: 50%;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 2vh 3vw;
  }
  
  .key-remapping-mouse-section {
    right: 5vw;
    top: 48%;
  }
}
</style> 