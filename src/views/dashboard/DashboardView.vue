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
          :device-model="deviceModel" 
          :mouse-image-src="mouseImageSrc"
          :current-d-p-i="currentDPI"
          :polling-rate="pollingRate"
          :battery-level="batteryLevel"
        />
      </div>
      
      <!-- Sensor Settings Panel (only visible in sensor mode) -->
      <SensorSettingsPanel v-if="activeTab === 'sensor'" />
      
      <!-- Router View for Tab Content -->
      <div class="content-overlay">
        <!-- <router-view /> -->
      </div>
    </div>

    <!-- Status Bar -->
    <div class="dashboard-footer" v-if="!isDPIMode && activeTab !== 'sensor'">
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
    SensorMouseDisplay
  },
  data() {
    return {
      activeTab: 'home',
      activeDPI: 1, // Default to second profile (1200 DPI)
      deviceInfo: HIDHandle.deviceInfo, // Reactive reference to HIDHandle
      realTimeTimer: null,
      // Track previous values to detect changes
      lastLoggedState: {
        battery: null,
        dpi: null,
        pollingRate: null,
        lod: null,
        motionSync: null,
        connectState: null
      },
      hasLoggedInitialConnection: false
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
      // Use HIDHandle directly for device info
      if (HIDHandle.deviceInfo.info && HIDHandle.deviceInfo.info.cid && HIDHandle.deviceInfo.info.mid) {
        return this.getDeviceNameFromCidMid(HIDHandle.deviceInfo.info.cid, HIDHandle.deviceInfo.info.mid)
      }
      return 'Ikarus' // Default mouse model
    },
    
    currentDPI() {
      // Use HIDHandle directly for current DPI
      const dpiIndex = HIDHandle.deviceInfo.mouseCfg.currentDpi;
      const dpiValue = HIDHandle.deviceInfo.mouseCfg.dpis[dpiIndex]?.value;
      console.log("📊 Dashboard DPI:", { dpiIndex, dpiValue, dpis: HIDHandle.deviceInfo.mouseCfg.dpis });
      return dpiValue || 1600;
    },
    
    batteryLevel() {
      // Use HIDHandle directly for battery level
      const level = HIDHandle.deviceInfo.battery.level;
      console.log("🔋 Dashboard Battery:", level);
      return level || 0;
    },
    
    pollingRate() {
      // Use HIDHandle directly for polling rate
      const rate = HIDHandle.deviceInfo.mouseCfg.reportRate;
      console.log("⚡ Dashboard Polling Rate:", rate);
      return rate || 1000;
    },
    
    liftOffDistance() {
      // Use HIDHandle directly for LOD
      const lod = HIDHandle.deviceInfo.mouseCfg.sensor.lod;
      console.log("📏 Dashboard LOD:", lod);
      return lod ? `${lod}MM` : '1MM';
    },
    
    motionSync() {
      // Use HIDHandle directly for motion sync
      const sync = HIDHandle.deviceInfo.mouseCfg.sensor.motionSync;
      console.log("🔄 Dashboard Motion Sync:", sync);
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
    
    // Start real-time monitoring for dashboard updates
    this.startRealTimeMonitoring();
    
    // Log initial dashboard state
    console.log("🎮 Dashboard mounted with device data:", {
      connected: HIDHandle.deviceInfo.deviceOpen,
      connectState: HIDHandle.deviceInfo.connectState,
      battery: this.batteryLevel + "%",
      dpi: this.currentDPI,
      pollingRate: this.pollingRate + "Hz",
      lod: this.liftOffDistance,
      motionSync: this.motionSync ? "ON" : "OFF",
      timestamp: new Date().toISOString()
    });
  },
  
  beforeDestroy() {
    // Clean up timer
    if (this.realTimeTimer) {
      clearInterval(this.realTimeTimer);
    }
  },
  
  watch: {
    // Watch for device connection changes
    isConnected(newVal) {
      if (!newVal) {
        console.log("❌ Device disconnected - redirecting to initialize");
        this.$router.push('/initialize');
      }
    },
    
    // Watch HIDHandle deviceInfo for changes
    deviceInfo: {
      handler(newInfo) {
        if (newInfo.deviceOpen) {
          this.checkForChangesAndLog();
        }
      },
      deep: true
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
      
      console.log("🔄 Dashboard real-time monitoring started");
    },
    
    checkForChangesAndLog() {
      const currentState = {
        battery: this.batteryLevel,
        dpi: this.currentDPI,
        pollingRate: this.pollingRate,
        lod: this.liftOffDistance,
        motionSync: this.motionSync,
        connectState: this.deviceInfo.connectState
      };
      
      // Log initial connection only once
      if (!this.hasLoggedInitialConnection && this.deviceInfo.connectState === 2) {
        console.log("✅ Device Connected - Initial Status:", {
          model: this.deviceModel,
          battery: currentState.battery + "%",
          dpi: currentState.dpi,
          pollingRate: currentState.pollingRate + "Hz",
          lod: currentState.lod,
          motionSync: currentState.motionSync ? "ON" : "OFF",
          timestamp: new Date().toISOString()
        });
        this.hasLoggedInitialConnection = true;
        this.lastLoggedState = { ...currentState };
        return;
      }
      
      // Check for actual changes and log only those
      const changes = {};
      let hasChanges = false;
      
      Object.keys(currentState).forEach(key => {
        if (this.lastLoggedState[key] !== currentState[key]) {
          changes[key] = {
            from: this.lastLoggedState[key],
            to: currentState[key]
          };
          hasChanges = true;
        }
      });
      
      if (hasChanges && this.hasLoggedInitialConnection) {
        console.log("🔄 Device Setting Changed:", changes);
        this.lastLoggedState = { ...currentState };
      }
    },
    
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
    
    getDeviceNameFromCidMid(cid, mid) {
      console.log("🔍 Device identification:", { cid, mid });
      
      // Map known device combinations to names
      const deviceMap = {
        '0_0': 'Unknown Device',
        // Add more mappings as needed based on your device IDs
      };
      
      const key = `${cid}_${mid}`;
      return deviceMap[key] || 'Ikarus'; // Default to Ikarus
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
  top: 45%;
  right: 8vw;
  transform: translateY(-50%);
  z-index: 1;
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