<template>
  <div class="dashboard-container" :data-active-tab="activeTab">
    <!-- Inactivity Overlay -->
    <div v-if="!isOnline" class="inactivity-overlay">
      <div class="inactivity-message">
          <div class="mouse-icon">
            <IconifyIcon icon="solar:mouse-outline" />
          </div>
          <h3>Mouse is asleep</h3>
          <p>Shake your mouse to wake it up.</p>
      </div>
    </div>

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
      <!-- Unified Mouse Display -->
      <UnifiedMouseDisplay
        v-if="activeTab !== 'sensor' && activeTab !== 'keys'"
        :mode="activeTab"
        :device-model="deviceModel"
        :mouse-image-src="mouseImageSrc"
        :is-panel-expanded="isKeyRemappingPanelExpanded"
      />
      
      <!-- DPI Control Bar (only visible in DPI mode) -->
      <div class="dpi-control-section" v-show="activeTab === 'dpi'">
        <DPIControlBar />
      </div>
      
      <!-- Panels for different tabs -->
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
          :is-charging="isCharging"
        />
      </div>
      
      <!-- Sensor Settings Panel (only visible in sensor mode) -->
      <SensorSettingsPanel v-if="activeTab === 'sensor'" />
      
      <!-- Key Remapping Mouse Display (only visible in keys mode) -->
      <div class="key-remapping-mouse-section" v-if="activeTab === 'keys'" :class="{ 'panel-expanded': isKeyRemappingPanelExpanded }">
        <KeyRemappingMouseDisplay 
          :device-model="deviceModel" 
          :mouse-image-src="mouseImageSrc"
          :selected-key.sync="selectedKey"
          :button-names="buttonNames"
          @key-selected="handleKeySelected"
        />
      </div>
      
      <!-- Key Remapping Panel (only visible in keys mode) -->
      <KeyRemappingPanel 
        v-if="activeTab === 'keys'" 
        @key-mapping-update="handleKeyMappingUpdate" 
        @panel-state-changed="handlePanelStateChange"
        @button-name-updated="handleButtonNameUpdate"
      />
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
        :is-charging="isCharging"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HIDHandle from '@/assets/js/HIDHandle'
import NavigationTabs from '@/components/dashboard/NavigationTabs.vue'
import UnifiedMouseDisplay from '@/components/dashboard/UnifiedMouseDisplay.vue' // Import unified component
import DPIControlBar from '@/components/dashboard/DPIControlBar.vue'
import DPISettingsPanel from '@/components/dashboard/DPISettingsPanel.vue'
import ActionButtons from '@/components/dashboard/ActionButtons.vue'
import BackButton from '@/components/dashboard/BackButton.vue'
import KreoLogo from '@/components/dashboard/KreoLogo.vue'
import StatusBar from '@/components/dashboard/StatusBar.vue'
import SensorSettingsPanel from '@/components/dashboard/SensorSettingsPanel.vue'
import RGBSettingsPanel from '@/components/dashboard/RGBSettingsPanel.vue'
import KeyRemappingPanel from '@/components/dashboard/KeyRemappingPanel.vue'
import SensorMouseDisplay from '@/components/dashboard/SensorMouseDisplay.vue'
import KeyRemappingMouseDisplay from '@/components/dashboard/KeyRemappingMouseDisplay.vue'

export default {
  name: 'DashboardView',
  components: {
    NavigationTabs,
    UnifiedMouseDisplay, // Use unified component
    DPIControlBar,
    DPISettingsPanel,
    ActionButtons,
    BackButton,
    KreoLogo,
    StatusBar,
    SensorSettingsPanel,
    KeyRemappingPanel,
    RGBSettingsPanel,
    SensorMouseDisplay,
    KeyRemappingMouseDisplay
  },
  data() {
    return {
      activeTab: 'home',
      activeDPI: 1, // Default to second profile (1200 DPI)
      deviceInfo: HIDHandle.deviceInfo, // Reactive reference to HIDHandle
      realTimeTimer: null,
      isKeyRemappingPanelExpanded: false,
      highlightedKey: null,
      selectedKey: null,
      buttonNames: {
        'left-click': 'Left click',
        'right-click': 'Right click',
        'middle-click': 'Middle click',
        'mouse-button-4': 'Mouse button 4 (Back)',
        'mouse-button-5': 'Mouse button 5 (Forward)'
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected', 'isOnline']),
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
    
    isCharging() {
      // Use reactive deviceInfo for charging status
      return this.deviceInfo?.battery?.charging || false;
    },
    
    mouseImageSrc() {
      return '/mice/ikarus.svg'
    }
  },
  
  async mounted() {
    // Initialize sensor settings from Vuex store
    this.$store.dispatch('settings/loadSettingsFromLocalStorage');
    
    // Start real-time monitoring for dashboard updates
    this.startRealTimeMonitoring();
    
    // Listen for direct sensor mouse display updates
    this.$bus.$on("updateSensorMouseDisplay", (data) => {
      this.updateSensorMouseDisplay(data.type, data.value)
    })

    // Load and sync macros when component mounts
    try {
      await this.$store.dispatch('macros/loadMacros');
      await this.syncMacrosToDevice();
    } catch (error) {
      console.error('Error loading macros:', error);
    }

    // Listen for macro updates
    this.$bus.$on("updateMacroList", () => {
      this.syncMacrosToDevice();
    });
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
    
    handleKeySelected(key) {
      // Handle key selection from mouse display
      this.selectedKey = key;
    },
    
    handleButtonNameUpdate({ key, name }) {
      // Update button names when they are changed in the panel
      this.buttonNames[key] = name;
      this.$forceUpdate(); // Force re-render to update the mouse display
    },
    
    handleKeyMappingUpdate(mapping) {
      // Handle key mapping update logic here
      console.log('Key mapping update received:', mapping);
      
      // Convert key name to device button index
      const keyIndex = this.getKeyIndex(mapping.key);
      if (keyIndex === -1) {
        console.error('Unknown key:', mapping.key);
        return;
      }
      
      // Apply the mapping to the device
      this.applyKeyMappingToDevice(keyIndex, mapping);
    },

    getKeyIndex(keyName) {
      // Map key names to device button indices
      const keyMap = {
        'left-click': 0,
        'right-click': 1,
        'middle-click': 2,
        'mouse-button-4': 3,
        'mouse-button-5': 4,
        // Add more mappings as needed
      };
      
      return keyMap[keyName] !== undefined ? keyMap[keyName] : -1;
    },

    async applyKeyMappingToDevice(keyIndex, mapping) {
      if (!this.isConnected) {
        console.warn('Device not connected, cannot apply key mapping');
        return;
      }

      try {
        let keyFunction = {};
        let macroData = null;

        // Convert function value to device format
        switch (mapping.value) {
          case 'left-click':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.MouseKey,
              param: 0x0100
            };
            break;
          case 'right-click':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.MouseKey,
              param: 0x0200
            };
            break;
          case 'middle-click':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.MouseKey,
              param: 0x0400
            };
            break;
          case 'back':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.MouseKey,
              param: 0x0800
            };
            break;
          case 'forward':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.MouseKey,
              param: 0x1000
            };
            break;
          case 'dpi-up':
          case 'dpi-down':
          case 'dpi-cycle':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.DPISwitch,
              param: 0x0001
            };
            break;
          case 'profile-cycle':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.ProfileSwitch,
              param: 0x0001
            };
            break;
          case 'disabled':
            keyFunction = {
              type: HIDHandle.MouseKeyFunction.Disable,
              param: 0x0000
            };
            break;
          case 'macro':
            if (mapping.macroData) {
              keyFunction = {
                type: HIDHandle.MouseKeyFunction.Macro,
                param: (keyIndex << 8) + parseInt(mapping.macroData.cycleTimes || 1)
              };
              
              // Prepare macro data for device
              macroData = {
                name: mapping.macroData.name,
                contexts: mapping.macroData.contexts || []
              };
            } else {
              console.error('Macro selected but no macro data provided');
              return;
            }
            break;
          default:
            console.error('Unknown function value:', mapping.value);
            return;
        }

        // If it's a macro, first set the macro data to the device slot
        if (mapping.value === 'macro' && macroData) {
          console.log('Setting macro data to device slot:', keyIndex, macroData);
          await HIDHandle.Set_MS_Macro(keyIndex, macroData);
          
          // Update the device's macro slot
          if (HIDHandle.deviceInfo.mouseCfg.macros[keyIndex]) {
            HIDHandle.deviceInfo.mouseCfg.macros[keyIndex] = {
              name: macroData.name,
              contexts: macroData.contexts,
              cycleTimes: macroData.cycleTimes || 1
            };
          }
        }

        // Set key function on device
        console.log('Setting key function:', keyIndex, keyFunction);
        await HIDHandle.Set_MS_KeyFunction(keyIndex, keyFunction);

        // Update the device's keys array to reflect the new assignment
        HIDHandle.deviceInfo.mouseCfg.keys[keyIndex] = [
          keyFunction.type.toString(16),
          "0x" + keyFunction.param.toString(16).padStart(4, '0')
        ];

        // Update the UI to reflect the change
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
        
        console.log('Key mapping applied successfully:', mapping.key, mapping.value);
        
      } catch (error) {
        console.error('Error applying key mapping to device:', error);
      }
    },

    async syncMacrosToDevice() {
      if (!this.isConnected) {
        console.warn('Device not connected, cannot sync macros');
        return;
      }

      try {
        // Get all macros from the macros store
        const macros = this.$store.getters['macros/allMacros'];
        
        // Convert Firebase macros to device format
        const deviceMacros = macros.map(macro => ({
          name: macro.name,
          contexts: macro.contexts || [],
          cycleTimes: macro.cycleTimes || 1
        }));

        // Initialize device macro slots (6 slots for 6 buttons)
        const macroSlots = new Array(6).fill(null).map(() => ({
          name: '',
          contexts: [],
          cycleTimes: 1
        }));

        // Update the device's internal macro list structure
        HIDHandle.deviceInfo.mouseCfg.macros = macroSlots;
        
        // Store available macros separately for reference
        HIDHandle.deviceInfo.mouseCfg.availableMacros = deviceMacros;
        
        // Emit event to update legacy system and UI
        this.$bus.$emit("updateMacroList", deviceMacros);
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
        
        console.log('Synced macros to device:', deviceMacros.length, 'available macros');
        
      } catch (error) {
        console.error('Error syncing macros to device:', error);
      }
    },

    handlePanelStateChange({ isExpanded, selectedKey }) {
      this.isKeyRemappingPanelExpanded = isExpanded;
      this.highlightedKey = selectedKey;
      this.selectedKey = selectedKey;
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

/* Remove old mouse-section and animated-mouse-section styles */
/* The new unified component handles its own positioning and animation */

.dpi-control-section {
  position: absolute;
  top: 20vh;
  left: calc(35% + 30vw);
  transform: translateX(-50%);
  width: 40%;
  z-index: 15;
  transition: opacity 0.5s ease;
  opacity: 0;
  pointer-events: none;
}

.dashboard-container[data-active-tab="dpi"] .dpi-control-section {
  opacity: 1;
  pointer-events: auto;
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

.inactivity-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(12, 12, 12, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  text-align: center;
  flex-direction: column;
}

.inactivity-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-family: 'DM Sans', sans-serif;
}

.mouse-icon svg {
  width: 48px;
  height: 48px;
  opacity: 0.8;
}

.inactivity-message h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.inactivity-message p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
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