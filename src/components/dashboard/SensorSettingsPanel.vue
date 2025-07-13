<template>
  <transition name="slide-in" appear>
    <div 
      class="sensor-settings-panel"
      @mouseenter="syncWithDeviceState"
    >
      <!-- Panel content split into two columns -->
      <div class="panel-inner">
        <!-- Left column -->
        <div class="left-col">
          <!-- Header -->
          <div class="panel-header">
            <h2 class="panel-title">Sensor</h2>
            <p class="panel-description">
              Tweak your mouse's sensor settings here
            </p>
          </div>

          <!-- Sensor Mode -->
          <div class="setting-section">
            <label class="setting-label">Sensor mode</label>
            <div class="button-group">
              <button
                v-for="mode in sensorModes"
                :key="mode.id"
                :class="['option-btn', { 
                  active: activeSensorMode === mode.id,
                  disabled: !isDeviceConnected || !isSensorModeSelectable(mode.id)
                }]"
                @click="handleSensorModeClick(mode.id)"
                :disabled="!isDeviceConnected || !isSensorModeSelectable(mode.id)"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- Lift-off Distance -->
          <div class="setting-section">
            <label class="setting-label">Lift of Distance</label>
            <div class="button-group wide">
              <button
                v-for="lod in liftOffOptions"
                :key="lod.id"
                :class="['option-btn', { active: activeLiftOff === lod.id }]"
                @click="handleLiftOffClick(lod.id)"
                :disabled="!isDeviceConnected"
              >
                {{ lod.label }}
              </button>
            </div>
          </div>

          <!-- Toggle controls -->
          <div class="setting-row" v-for="toggle in toggles" :key="toggle.id">
            <span class="setting-label">{{ toggle.label }}</span>

            <!-- New toggle switch -->
            <div
              class="toggle-switch"
              :class="{ checked: toggle.model, disabled: !isDeviceConnected }"
              @click="handleToggleClick(toggle.id)"
            >
              <div class="toggle-knob"></div>
            </div>
          </div>

          <!-- Sleep timer -->
          <div class="setting-row">
            <span class="setting-label">Sleep timer</span>
            <div class="dropdown-container" @click="toggleSleepDropdown">
              <span class="dropdown-value">{{ sleepTimer }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="dropdown-icon" :class="{ rotated: sleepDropdownOpen }">
                <path d="M7 10L12 15L17 10" stroke="#D4D4D8" stroke-width="1.5" />
              </svg>
            </div>
            <!-- Dropdown Options -->
            <transition name="sleep-dropdown">
              <div v-if="sleepDropdownOpen" class="sleep-dropdown-options">
                <div 
                  v-for="(timerStep, index) in sleepTimerSteps" 
                  :key="timerStep.value"
                  class="sleep-dropdown-option"
                  @click.stop="selectSleepTimer(index)"
                >
                  {{ formatSleepTimerOption(timerStep) }}
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Right column -->
        <div class="right-col">
          <h3 class="sub-header">
            Polling rate <span class="unit">(Hz)</span>
          </h3>
          <p class="sub-description">Change your mouse's polling here</p>

          <!-- Polling rate labels & slider -->
          <div class="polling-rate-selector">
            <div class="rate-labels">
              <span
                v-for="(rate, i) in pollingRates"
                :key="rate"
                :class="['rate-label', { active: activePollingRate === rate, disabled: !isDeviceConnected }]"
                @click="handlePollingRateClick(i)"
              >
                {{ rate }}
              </span>
            </div>
            <div class="slider-container">
              <input
                type="range"
                min="0"
                :max="pollingRates.length - 1"
                v-model="pollingIndex"
                @input="handlePollingRateClick(pollingIndex)"
                class="polling-slider"
                :style="{ '--fill-percent': fillPercent + '%' }"
                :disabled="!isDeviceConnected"
              />
              <!-- Animated knob -->
              <div
                class="slider-thumb"
                :style="{ left: fillPercent + '%' }"
              ></div>
            </div>
          </div>

          <!-- Reset button -->
          <button class="reset-btn" @click="resetToDefault">
            <img src="/icons/resettodefault.svg" alt="Reset to default" class="reset-icon" />
            Reset to default
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SensorSettingsPanel',
  data() {
    return {
      // Device info reference for real-time monitoring
      deviceInfo: HIDHandle.deviceInfo,
      
      // Sleep timer dropdown state
      sleepDropdownOpen: false,
      
      // Flag to prevent infinite loops during sync
      isUpdatingFromDevice: false,
      isUpdatingFromVuex: false
    }
  },
  computed: {
    ...mapGetters('settings', [
      'sensorMode',
      'sensorLOD', 
      'sensorPerformanceState',
      'sensorPerformance',
      'sensorRipple',
      'sensorAngle',
      'sensorMotionSync',
      'sensorPollingRate',
      'sensorSleepTimer',
      'isWiredDevice',
      'isCorderMode'
    ]),
      
      // Sensor mode buttons
    sensorModes() {
      return [
        { id: 0, label: 'Low Power' },
        { id: 1, label: 'High Power' },
        { id: 256, label: 'Corded' }
      ]
    },

    // Current active sensor mode from Vuex
    activeSensorMode() {
      return this.sensorMode
    },

      // Lift-off distance options
    liftOffOptions() {
      return [
        { id: 1, label: '1mm', value: 1.0 },
        { id: 2, label: '2mm', value: 2.0 }
      ]
    },

    // Current active lift-off distance from Vuex
    activeLiftOff() {
      return this.sensorLOD
    },

    // Toggle switches with Vuex state
    toggles() {
      return [
        { id: 'ripple', label: 'Ripple control', model: this.sensorRipple },
        { id: 'angle', label: 'Angle snap', model: this.sensorAngle },
        { id: 'motion', label: 'Motion sync', model: this.sensorMotionSync }
      ]
    },

    // Sleep timer value mapping (EXACT same as OtherSetting.vue)
    sleepTimerSteps() {
      return [
        { value: 1, label: '10 sec' },
        { value: 3, label: '30 sec' },
        { value: 6, label: '1 min' },
        { value: 12, label: '2 mins' },
        { value: 30, label: '5 mins' },
        { value: 60, label: '10 mins' },
        { value: 90, label: '15 mins' }
      ];
    },

    // Current sleep timer index from Vuex
    sleepTimerIndex() {
      const index = this.sleepTimerSteps.findIndex(step => step.value === this.sensorSleepTimer)
      return index !== -1 ? index : 2
    },

      // Polling rates (Hz)
    pollingRates() {
      return [125, 500, 1000, 2000, 4000]
    },

    // Current polling rate index from Vuex
    pollingIndex() {
      return this.pollingRates.indexOf(this.sensorPollingRate) || 2
    },

    activePollingRate() {
      return this.sensorPollingRate
    },

    fillPercent() {
      return (this.pollingIndex / (this.pollingRates.length - 1)) * 100
    },

    sleepTimer() {
      const timerStep = this.sleepTimerSteps[this.sleepTimerIndex]
      return timerStep ? timerStep.label : '1 min'
    },

    isDeviceConnected() {
      return this.deviceInfo.deviceOpen && this.deviceInfo.connectState === 2
    },

    // Check if current polling rate requires corded mode
    isHighPollingRate() {
      return this.activePollingRate >= 2000
    },

    // Get available sensor modes based on polling rate
    availableSensorModes() {
      if (this.isHighPollingRate) {
        // Only Corded mode available for 2000Hz and 4000Hz
        return [{ id: 256, label: 'Corded' }]
      } else {
        // Low Power and High Power available for rates below 2000Hz
        return [
          { id: 0, label: 'Low Power' },
          { id: 1, label: 'High Power' }
        ]
      }
    },

    // Check if a sensor mode is selectable
    isSensorModeSelectable() {
      return (modeId) => {
        return this.availableSensorModes.some(mode => mode.id === modeId)
      }
    }
  },
  
  mounted() {
    // Initialize settings from Vuex store first
    this.initializeFromVuex()
    
    this.$nextTick(() => {
      // Then sync with connected device, prioritizing persisted settings
      this.initializeFromDevice()
    })

    // Listen for real-time device updates for sleep timer (matching OtherSetting.vue pattern)
    this.$bus.$on("updateMouseUI", (value) => {
      if (value && value.sleepTime !== undefined) {
        // Directly update Vuex state to match device state (like OtherSetting.vue does)
        this.isUpdatingFromDevice = true;
        this.setSensorSleepTimer(value.sleepTime);
        this.$nextTick(() => {
          this.isUpdatingFromDevice = false;
        });
      }
    });
    
    // Also listen for explicit device connection events
    this.$bus.$on("deviceConnect", (connected) => {
      if (connected) {
        setTimeout(() => this.initializeFromDevice(), 500);
      }
    });
  },
  
  beforeDestroy() {
    // Clean up event listeners
    this.$bus.$off("updateMouseUI")
    this.$bus.$off("deviceConnect")
  },
  
  watch: {
    // Watch Vuex state changes and sync to device
    sensorMode(newMode, oldMode) {
      if (!this.isUpdatingFromVuex && this.isDeviceConnected && oldMode !== undefined) {
        this.syncModeToDevice(newMode)
      }
      // Auto-save to localStorage when settings change
      if (oldMode !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },
    
    sensorLOD(newLOD, oldLOD) {
      if (!this.isUpdatingFromVuex && this.isDeviceConnected && oldLOD !== undefined) {
        this.syncLODToDevice(newLOD)
      }
      // Auto-save to localStorage when settings change
      if (oldLOD !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },
    
    sensorPollingRate(newRate, oldRate) {
      if (!this.isUpdatingFromVuex && this.isDeviceConnected && oldRate !== undefined) {
        this.syncPollingRateToDevice(newRate)
      }
      // Auto-save to localStorage when settings change
      if (oldRate !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },
    
    sensorRipple(newVal, oldVal) {
      if (!this.isUpdatingFromVuex && this.isDeviceConnected && oldVal !== undefined) {
        this.syncRippleToDevice(newVal)
      }
      // Auto-save to localStorage when settings change
      if (oldVal !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },
    
    sensorAngle(newVal, oldVal) {
      if (!this.isUpdatingFromVuex && this.isDeviceConnected && oldVal !== undefined) {
        this.syncAngleToDevice(newVal)
      }
      // Auto-save to localStorage when settings change
      if (oldVal !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },
    
    sensorMotionSync(newVal, oldVal) {
      if (!this.isUpdatingFromVuex && this.isDeviceConnected && oldVal !== undefined) {
        this.syncMotionSyncToDevice(newVal)
      }
      // Auto-save to localStorage when settings change
      if (oldVal !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },
    
    sensorSleepTimer(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncPerformanceToDevice(newVal)
      }
      // Auto-save to localStorage whenever the setting changes
      if (oldVal !== undefined) {
        this.saveSettingsToLocalStorage()
      }
    },

    // Monitor device connection changes
    'deviceInfo.deviceOpen'(newVal) {
      if (newVal) {
        this.initializeFromDevice()
      }
    },
    
    // Monitor device info changes for real-time sync from device to Vuex
    'deviceInfo.mouseCfg.sensor': {
      handler() {
        // CRITICAL: Never override persisted settings
        const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
        if (hasPersistedSettings) {
          return
        }
        
        // Only sync from device if we don't have persisted settings and we're not updating from device
        if (!this.isUpdatingFromDevice && this.isDeviceConnected) {
          this.syncFromDeviceToVuex()
        }
      },
      deep: true
    },
    
    'deviceInfo.mouseCfg.reportRate'(newRate) {
      // CRITICAL: Never override persisted settings
      const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
      if (hasPersistedSettings) {
        return
      }
      
      // Only sync polling rate if we don't have persisted settings
      if (!this.isUpdatingFromDevice && this.isDeviceConnected) {
        this.setSensorPollingRate(newRate)
      }
    }
  },
  
  methods: {
    // Vuex actions for updating state
    ...mapActions('settings', [
      'setSensorMode',
      'setSensorLOD',
      'setSensorPerformanceState',
      'setSensorPerformance',
      'setSensorRipple',
      'setSensorAngle',
      'setSensorMotionSync',
      'setSensorPollingRate',
      'setSensorSleepTimer',
      'setWiredDevice',
      'setCorderMode',
      'updateSensorSettings',
      'initializeSensorSettingsFromDevice',
      'resetSensorSettings',
      'saveSettingsToLocalStorage'
    ]),

    // This function is disabled as it was causing state conflicts.
    // State is now managed by initializing from localStorage/device on mount,
    // and then listening to specific `updateMouseUI` events.
    syncWithDeviceState() {
      return;
    },
  
    // Initialize from Vuex store
    initializeFromVuex() {
      // Settings are already available through computed properties
      // CRITICAL: If we have persisted settings and device is connected, apply them immediately
      const storedSettings = localStorage.getItem('kreo_sensor_settings')
      if (storedSettings && this.isDeviceConnected) {
        this.$nextTick(() => {
          this.applyVuexSettingsToDevice()
        })
      }
    },

    async initializeFromDevice() {
      if (!this.isDeviceConnected) return
      
      this.isUpdatingFromDevice = true
      
      try {
        // CRITICAL: Always check for persisted settings first
        const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
        
        if (hasPersistedSettings) {
          // We have persisted settings - apply them to device instead of reading from device
          await this.applyVuexSettingsToDevice()
          
          // Force save to ensure localStorage is up to date
          await this.saveSettingsToLocalStorage()
        } else {
          // No persisted settings - initialize Vuex from device
          await this.initializeSensorSettingsFromDevice(this.deviceInfo)
          
          // Save current state to localStorage
          await this.saveSettingsToLocalStorage()
        }
        
      } catch (error) {
        console.error('Error initializing from device:', error)
      } finally {
        this.isUpdatingFromDevice = false
      }
    },
    
    // Apply current Vuex settings to the device (when we have persisted settings)
    async applyVuexSettingsToDevice() {
      if (!this.isDeviceConnected) return
      
      try {
        // Apply all current Vuex settings to device
        await HIDHandle.Set_MS_SensorMode(this.sensorMode)
        await HIDHandle.Set_MS_LOD(this.sensorLOD)
        await HIDHandle.Set_MS_ReportRate(this.sensorPollingRate)
        await HIDHandle.Set_MS_Ripple(this.sensorRipple ? 1 : 0)
        await HIDHandle.Set_MS_Angle(this.sensorAngle ? 1 : 0)
        await HIDHandle.Set_MS_MotionSync(this.sensorMotionSync ? 1 : 0)
        await HIDHandle.Set_MS_LightOffTime(this.sensorSleepTimer)
        
        // Update UI
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
        console.log("Successfully applied persisted Vuex settings to the device.");
        
      } catch (error) {
        console.error('Error applying Vuex settings to device:', error)
      }
    },

    // Start monitoring device changes
    startDeviceMonitoring() {
      // Device monitoring is handled by Vue watchers
      // This method can be used for additional monitoring if needed
    },

    // Sync from device to Vuex
    syncFromDeviceToVuex() {
      if (!this.isDeviceConnected) return
      
      // CRITICAL: Never override persisted settings
      const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
      if (hasPersistedSettings) {
        return
      }
      
      this.isUpdatingFromDevice = true
      
      try {
      const sensor = this.deviceInfo.mouseCfg.sensor
      const reportRate = this.deviceInfo.mouseCfg.reportRate
      
        // Update Vuex store with device values
        if (sensor.sensorMode !== undefined && sensor.sensorMode !== this.sensorMode) {
          this.setSensorMode(sensor.sensorMode)
        }
        
        if (sensor.lod !== undefined && sensor.lod !== this.sensorLOD) {
          this.setSensorLOD(sensor.lod)
        }
        
        if (reportRate !== undefined && reportRate !== this.sensorPollingRate) {
          this.setSensorPollingRate(reportRate)
        }
        
        if (sensor.ripple !== undefined && Boolean(sensor.ripple) !== this.sensorRipple) {
          this.setSensorRipple(Boolean(sensor.ripple))
        }
        
        if (sensor.angle !== undefined && Boolean(sensor.angle) !== this.sensorAngle) {
          this.setSensorAngle(Boolean(sensor.angle))
        }
        
        if (sensor.motionSync !== undefined && Boolean(sensor.motionSync) !== this.sensorMotionSync) {
          this.setSensorMotionSync(Boolean(sensor.motionSync))
        }
        
        if (sensor.performance !== undefined && sensor.performance !== this.sensorSleepTimer) {
          this.setSensorSleepTimer(sensor.performance)
        }
        
        // Save to localStorage after sync
        this.saveSettingsToLocalStorage()
        
      } catch (error) {
        console.error('Error syncing from device to Vuex:', error)
      } finally {
        this.isUpdatingFromDevice = false
      }
    },

    // Sync individual settings to device
    async syncModeToDevice(mode) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_SensorMode(mode)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Error syncing sensor mode to device:', error)
      }
    },

    async syncLODToDevice(lod) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_LOD(lod)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Error syncing LOD to device:', error)
      }
    },

    async syncPollingRateToDevice(rate) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_ReportRate(rate)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
        this.$bus.$emit("pollingRateChanged", rate)
      } catch (error) {
        console.error('Error syncing polling rate to device:', error)
      }
    },

    async syncRippleToDevice(enabled) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_Ripple(enabled ? 1 : 0)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Error syncing ripple to device:', error)
      }
    },

    async syncAngleToDevice(enabled) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_Angle(enabled ? 1 : 0)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Error syncing angle to device:', error)
      }
    },

    async syncMotionSyncToDevice(enabled) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_MotionSync(enabled ? 1 : 0)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Error syncing motion sync to device:', error)
      }
    },

    async syncSleepTimerToDevice(timer) {
      if (!this.isDeviceConnected) return;
      try {
        await HIDHandle.Set_MS_LightOffTime(timer);
        // This emit is PREMATURE. It broadcasts the OLD device state before the
        // device has had time to process the change and report back. HIDHandle
        // will emit the proper "updateMouseUI" event once it receives a
        // confirmation from the device. Removing this line fixes the revert.
        // this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg);
      } catch (error) {
        console.error("Error syncing sleep timer to device:", error);
      }
    },

    // Add the missing syncPerformanceToDevice method (same as sleep timer)
    async syncPerformanceToDevice(performance) {
      if (!this.isDeviceConnected) return;
      try {
        await HIDHandle.Set_MS_LightOffTime(performance);
        console.log("✅ Sleep timer/performance synced to device:", performance);
      } catch (error) {
        console.error("Error syncing performance/sleep timer to device:", error);
      }
    },

    // UI event handlers - these now update Vuex state
    handleSensorModeClick(mode) {
      if (!this.isDeviceConnected || !this.isSensorModeSelectable(mode)) return
      
      this.setSensorMode(mode)
    },

    handleLiftOffClick(lodId) {
      if (!this.isDeviceConnected) return
      
      this.setSensorLOD(lodId)
    },

    handleToggleClick(toggleId) {
      if (!this.isDeviceConnected) return
      
      switch (toggleId) {
        case 'ripple':
          this.setSensorRipple(!this.sensorRipple)
          break
        case 'angle':
          this.setSensorAngle(!this.sensorAngle)
          break
        case 'motion':
          this.setSensorMotionSync(!this.sensorMotionSync)
          break
      }
    },

    handlePollingRateClick(index) {
      if (!this.isDeviceConnected) return
      
      const rate = this.pollingRates[index]
      if (!rate) return
      
      this.setSensorPollingRate(rate)
      
      // Handle automatic sensor mode switching
      this.handlePollingRateChange(index)
    },

    handlePollingRateChange(newIndex) {
      const newRate = this.pollingRates[newIndex]
      
      if (newRate >= 2000) {
        // Auto-switch to Corded mode for high polling rates
        if (this.sensorMode !== 256) {
          this.setSensorMode(256)
        }
      } else {
        // Auto-switch away from Corded mode for lower polling rates
        if (this.sensorMode === 256) {
          this.setSensorMode(0) // Default to Low Power
        }
      }
    },
    
    async resetToDefault() {
      if (!this.isDeviceConnected) return
      
      try {
        // Reset hardware to defaults
        await HIDHandle.Set_MS_SensorMode(0)          // Low Power
        await HIDHandle.Set_MS_LOD(1.0)               // 1mm
        await HIDHandle.Set_MS_ReportRate(1000)       // 1000Hz
        await HIDHandle.Set_MS_Ripple(0)              // Off
        await HIDHandle.Set_MS_Angle(0)               // Off
        await HIDHandle.Set_MS_MotionSync(1)          // On
        await HIDHandle.Set_MS_LightOffTime(6)        // 1 min sleep timer
        
        // Reset Vuex state to defaults
        await this.resetSensorSettings()
        
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
        
      } catch (error) {
        console.error("Failed to reset settings:", error)
      }
    },
    
    toggleSleepDropdown() {
      this.sleepDropdownOpen = !this.sleepDropdownOpen
    },
    
    formatSleepTimerOption(timerStep) {
      return timerStep ? timerStep.label : 'Unknown'
    },

    // Updated to match OtherSetting.vue pattern - direct device sync + Vuex update
    async selectSleepTimer(index) {
      this.sleepDropdownOpen = false;
      const timerStep = this.sleepTimerSteps[index];
      if (timerStep) {
        // Update Vuex state first
        this.setSensorSleepTimer(timerStep.value);
        // Keep performance in sync (one-way)
        this.setSensorPerformance(timerStep.value);
        
        // Direct device sync (like OtherSetting.vue does)
        if (this.isDeviceConnected) {
          try {
            await HIDHandle.Set_MS_LightOffTime(timerStep.value);
            console.log("✅ Sleep timer updated directly on device:", timerStep.value);
          } catch (error) {
            console.error("Error updating sleep timer on device:", error);
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-in-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-in-enter {
  transform: translateX(-100%);
  opacity: 0;
}

.sensor-settings-panel {
  position: fixed;
  left: 3vw;
  top: calc(10vh + 80px);
  bottom: 100px;
  width: 784px;
  background: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 31px 24px 24px 24px;
  z-index: 20;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }

  .panel-inner {
    display: flex;
    gap: 24px;
    width: 100%;
  }

  .left-col {
    flex: 1 1 50%;
  }

  .right-col {
    flex: 1 1 50%;
  }
}

.panel-header {
  margin-bottom: 24px;
}

.panel-title {
  color: white;
  font-size: 30px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  margin: 0 0 12px 0;
}

.panel-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  margin: 0;
  line-height: 1.4;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-label {
  color: #d4d4d8;
  font-size: 20px;
  font-family: 'DM Sans', sans-serif;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 12px;

  &.wide {
    gap: 24px;
  }
}

.option-btn {
  flex: 1 1 0;
  padding: 14px 0;
  border-radius: 12px;
  border: 1.5px solid #a278fd;
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease;

  &.active,
  &:hover:not(:disabled) {
    background: #a278fd33;
  }
  
  &:disabled,
  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: #444;
    color: #666;
    background: transparent !important;
  }
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 6px 0;
  position: relative;
}

/* Toggle switch */
.switch {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #27272a;
  border-radius: 34px;
  transition: 0.2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background-color: #52525b;
  border-radius: 50%;
  transition: 0.2s;
}

input:checked + .slider {
  background-color: #a278fd;
}

input:checked + .slider:before {
  transform: translateX(36px);
  background-color: white;
}

/* Sleep timer dropdown */
.dropdown-container {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  min-width: 80px;
}

.dropdown-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  color: #a278fd;
  white-space: nowrap;
}

.dropdown-icon {
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.sleep-dropdown-options {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 100px;
  max-height: 280px;
  background: #262626;
  border-radius: 8px;
  z-index: 10;
  overflow-y: auto;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  transform-origin: bottom center;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.4);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #a278fd;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #9266e6;
  }
}

.sleep-dropdown-option {
  height: 32px;
  background: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
  overflow: hidden;
  padding: 0 8px;

  &:hover {
    background: #404040;
  }
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
}

/* Right column */
.sub-header {
  color: white;
  font-size: 30px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 12px;
}

.unit {
  font-size: 14px;
}

.sub-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 32px;
}

.polling-rate-selector {
  width: 100%;
  margin-bottom: 32px;
}

.rate-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rate-label {
  color: white;
  font-size: 16px;
  font-family: 'DM Sans', sans-serif;
  opacity: 0.3;
  transition: opacity 0.2s ease;
  cursor: pointer;

  &.active {
    opacity: 1;
  }
  
  &.disabled {
    opacity: 0.2;
    cursor: not-allowed;
    color: #666;
  }
}

.slider-container {
  position: relative;
  width: 100%;
  height: 24px; /* provides room for 16px knob + spacing */
}

.polling-slider {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 4px;
  transform: translateY(-50%);
  appearance: none;
  border-radius: 8px;
  /* Base track */
  background: #27272a;
  /* Filled portion overlay */
  background-image: linear-gradient(#a278fd, #a278fd);
  background-repeat: no-repeat;
  background-size: var(--fill-percent) 100%;
  transition: background-size 0.3s ease;
  outline: none;
  cursor: pointer;

  /* hide default thumb */
  &::-webkit-slider-thumb {
    appearance: none;
    width: 0;
    height: 0;
  }

  &::-moz-range-thumb {
    width: 0;
    height: 0;
    border: none;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-image: linear-gradient(#666, #666);
  }
}

.slider-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #a278fd;
  pointer-events: none;
  transition: left 0.3s ease;
}

.reset-btn {
  width: 320px;
  height: 48px;
  background: #27272a;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-left: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: white;

  &:hover {
    background: #3f3f46;
  }
}

.reset-icon {
  width: 18px;
  height: 18px;
  filter: brightness(0) invert(1);
}

/* ===== New toggle switch (Tailwind-like design) ===== */

.toggle-switch {
  position: relative;
  width: 64px;  /* w-16 */
  height: 28px; /* h-7  */
  background: #27272a; /* bg-neutral-800 */
  border-radius: 9999px; /* rounded-3xl */
  overflow: hidden;
  cursor: pointer;
  /* Delay the background change so knob moves first */
  transition: background 0.2s ease 0.2s;

  &.checked {
    background: #a278fd;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &.checked {
      background: #666;
    }
  }

  .toggle-knob {
    position: absolute;
    width: 28px; /* w-7 */
    height: 28px; /* h-7 */
    top: 0;
    left: 0;
    background: #52525b; /* bg-zinc-700 */
    border-radius: 9999px;
    transition: transform 0.2s ease;
  }

  &.checked .toggle-knob {
    transform: translateX(36px); /* (64-28) + (1px gap) ≈ 37 px but adjust for border radius */
    background: white;
  }
  
  &.disabled .toggle-knob {
    background: #444;
  }
  
  &.disabled.checked .toggle-knob {
    background: #888;
  }
}

// Sleep timer dropdown animation
.sleep-dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: bottom center;
}

.sleep-dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  transform-origin: bottom center;
}

.sleep-dropdown-enter-from {
  opacity: 0;
  transform: scaleY(0.7) translateY(8px);
}

.sleep-dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8) translateY(4px);
}

.sleep-dropdown-enter-to,
.sleep-dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}
</style> 