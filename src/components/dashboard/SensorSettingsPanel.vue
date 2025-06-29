<template>
  <transition name="slide-in" appear>
    <div class="sensor-settings-panel">
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
                :class="['option-btn', { active: activeSensorMode === mode.id }]"
                @click="handleSensorModeClick(mode.id)"
                :disabled="!isDeviceConnected"
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
              <span class="dropdown-value">{{ sleepTimer }} mins</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="dropdown-icon" :class="{ rotated: sleepDropdownOpen }">
                <path d="M7 10L12 15L17 10" stroke="#D4D4D8" stroke-width="1.5" />
              </svg>
            </div>
            <!-- Dropdown Options -->
            <transition name="sleep-dropdown">
              <div v-if="sleepDropdownOpen" class="sleep-dropdown-options">
                <div 
                  v-for="(minutes, index) in sleepTimerSteps" 
                  :key="minutes"
                  class="sleep-dropdown-option"
                  @click.stop="selectSleepTimer(index)"
                >
                  {{ minutes }} mins
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

export default {
  name: 'SensorSettingsPanel',
  data() {
    return {
      // Device info reference for real-time monitoring
      deviceInfo: HIDHandle.deviceInfo,
      
      // Sensor mode buttons
      sensorModes: [
        { id: 1, label: 'High Power' },
        { id: 2, label: 'Low Power' },
        { id: 3, label: 'Corded' }
      ],
      activeSensorMode: 1,

      // Lift-off distance options
      liftOffOptions: [
        { id: 1, label: '0.7mm', value: 0.7 },
        { id: 2, label: '1mm', value: 1.0 },
        { id: 3, label: '2mm', value: 2.0 }
      ],
      activeLiftOff: 1,

      // Toggle switches
      toggles: [
        { id: 'ripple', label: 'Ripple control', model: false },
        { id: 'angle', label: 'Angle snap', model: false },
        { id: 'motion', label: 'Motion sync', model: false }
      ],

      // Sleep timer value in minutes
      sleepTimerSteps: [1, 2, 5, 10, 15, 30],
      sleepTimerIndex: 2, // default 5 mins
      sleepDropdownOpen: false,

      // Polling rates (Hz)
      pollingRates: [125, 500, 1000, 2000, 4000],
      pollingIndex: 0, // Default to 125Hz
      
      // Flag to prevent infinite loops during sync
      isUpdatingFromDevice: false
    }
  },
  computed: {
    activePollingRate() {
      return this.pollingRates[this.pollingIndex]
    },
    fillPercent() {
      return (this.pollingIndex / (this.pollingRates.length - 1)) * 100
    },
    sleepTimer() {
      return this.sleepTimerSteps[this.sleepTimerIndex]
    },
    isDeviceConnected() {
      return this.deviceInfo.deviceOpen && this.deviceInfo.connectState === 2
    }
  },
  
  mounted() {
    // Initialize settings from connected device
    this.initializeFromDevice()
    
    // Start monitoring device changes
    this.startDeviceMonitoring()
    
    if (this.isDeviceConnected) {
      console.log("🔧 Sensor settings panel initialized")
    }
  },
  
  beforeDestroy() {
    // Clean up any timers if needed
    console.log("🔧 Sensor settings panel disconnected")
  },
  
  watch: {
    // Monitor device connection changes
    'deviceInfo.deviceOpen'(newVal) {
      if (newVal) {
        this.initializeFromDevice()
      }
    },
    
    // Monitor device info changes for real-time sync
    'deviceInfo.mouseCfg.sensor': {
      handler() {
        if (!this.isUpdatingFromDevice && this.isDeviceConnected) {
          this.syncFromDevice()
        }
      },
      deep: true
    },
    
    'deviceInfo.mouseCfg.reportRate'(newRate) {
      if (!this.isUpdatingFromDevice && this.isDeviceConnected) {
        const rateIndex = this.pollingRates.indexOf(newRate)
        if (rateIndex !== -1) {
          this.pollingIndex = rateIndex
        }
      }
    },
    
    // Watch UI changes and send to device (backup watchers - direct handlers are primary)
    activeSensorMode(newMode, oldMode) {
      if (!this.isUpdatingFromDevice && this.isDeviceConnected && oldMode !== undefined) {
        this.setSensorMode(newMode)
      }
    },
    
    activeLiftOff(newLOD, oldLOD) {
      if (!this.isUpdatingFromDevice && this.isDeviceConnected && oldLOD !== undefined) {
        this.setLiftOffDistance(newLOD)
      }
    },
    
    pollingIndex(newIndex, oldIndex) {
      if (!this.isUpdatingFromDevice && this.isDeviceConnected && oldIndex !== undefined) {
        this.setPollingRate(newIndex)
      }
    },
    
    // Watch toggle changes
    toggles: {
      handler(newToggles, oldToggles) {
        if (!this.isUpdatingFromDevice && this.isDeviceConnected && oldToggles) {
          newToggles.forEach((toggle, index) => {
            const oldToggle = oldToggles[index]
            if (oldToggle && toggle.model !== oldToggle.model) {
              this.setToggleSetting(toggle.id, toggle.model)
            }
          })
        }
      },
      deep: true
    }
  },
  
  methods: {
    async initializeFromDevice() {
      if (!this.isDeviceConnected) return
      
      this.isUpdatingFromDevice = true
      
      try {
        // Initialize from current device state
        this.syncFromDevice()
      } catch (error) {
        console.error("❌ Failed to initialize sensor settings from device:", error)
      } finally {
        this.isUpdatingFromDevice = false
      }
    },
    
    syncFromDevice() {
      const sensor = this.deviceInfo.mouseCfg.sensor
      const reportRate = this.deviceInfo.mouseCfg.reportRate
      
      // Sync sensor mode
      if (sensor.sensorMode !== undefined) {
        this.activeSensorMode = sensor.sensorMode || 1
      }
      
      // Sync lift-off distance
      if (sensor.lod !== undefined) {
        const lodOption = this.liftOffOptions.find(opt => opt.value === sensor.lod)
        if (lodOption) {
          this.activeLiftOff = lodOption.id
        }
      }
      
      // Sync polling rate
      if (reportRate !== undefined) {
        const rateIndex = this.pollingRates.indexOf(reportRate)
        if (rateIndex !== -1) {
          this.pollingIndex = rateIndex
        }
      }
      
      // Sync toggles
      this.toggles.forEach(toggle => {
        switch (toggle.id) {
          case 'ripple':
            toggle.model = sensor.ripple || false
            break
          case 'angle':
            toggle.model = sensor.angle || false
            break
          case 'motion':
            toggle.model = sensor.motionSync || false
            break
        }
      })
    },
    
    async setSensorMode(mode) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_SensorMode(mode)
        console.log("🔧 Sensor mode set to:", mode)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error("❌ Failed to set sensor mode:", error)
        // Revert on error
        this.isUpdatingFromDevice = true
        this.activeSensorMode = this.deviceInfo.mouseCfg.sensor.sensorMode || 1
        this.isUpdatingFromDevice = false
      }
    },
    
    async setLiftOffDistance(lodId) {
      if (!this.isDeviceConnected) return
      
      const lodOption = this.liftOffOptions.find(opt => opt.id === lodId)
      if (!lodOption) return
      
      try {
        await HIDHandle.Set_MS_LOD(lodOption.value)
        console.log("📏 Lift-off distance set to:", lodOption.label)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error("❌ Failed to set lift-off distance:", error)
        // Revert on error
        this.isUpdatingFromDevice = true
        this.syncFromDevice()
        this.isUpdatingFromDevice = false
      }
    },
    
    async setPollingRate(index) {
      if (!this.isDeviceConnected) return
      
      const rate = this.pollingRates[index]
      if (!rate) return
      
      try {
        await HIDHandle.Set_MS_ReportRate(rate)
        console.log("📡 Polling rate set to:", rate + "Hz")
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error("❌ Failed to set polling rate:", error)
        // Revert on error
        this.isUpdatingFromDevice = true
        const currentRate = this.deviceInfo.mouseCfg.reportRate
        const currentIndex = this.pollingRates.indexOf(currentRate)
        if (currentIndex !== -1) {
          this.pollingIndex = currentIndex
        }
        this.isUpdatingFromDevice = false
      }
    },
    
    async setToggleSetting(settingId, value) {
      if (!this.isDeviceConnected) return
      
      try {
        switch (settingId) {
          case 'ripple':
            await HIDHandle.Set_MS_Ripple(value)
            console.log("🌊 Ripple control set to:", value ? "ON" : "OFF")
            break
          case 'angle':
            await HIDHandle.Set_MS_Angle(value)
            console.log("📐 Angle snap set to:", value ? "ON" : "OFF")
            break
          case 'motion':
            await HIDHandle.Set_MS_MotionSync(value)
            console.log("🔄 Motion sync set to:", value ? "ON" : "OFF")
            break
        }
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error(`❌ Failed to set ${settingId}:`, error)
        // Revert on error
        this.isUpdatingFromDevice = true
        this.syncFromDevice()
        this.isUpdatingFromDevice = false
      }
    },
    
    startDeviceMonitoring() {
      // Real-time monitoring is handled by watchers
      // This method can be extended for additional monitoring if needed
    },
    
    // Direct handlers as fallback for UI interactions
    async handleSensorModeClick(mode) {
      if (this.isDeviceConnected) {
        this.activeSensorMode = mode
        await this.setSensorMode(mode)
      }
    },
    
    async handleLiftOffClick(lodId) {
      if (this.isDeviceConnected) {
        this.activeLiftOff = lodId
        await this.setLiftOffDistance(lodId)
      }
    },
    
    async handlePollingRateClick(index) {
      if (this.isDeviceConnected) {
        this.pollingIndex = index
        await this.setPollingRate(index)
      }
    },
    
    async handleToggleClick(toggleId) {
      if (this.isDeviceConnected) {
        const toggle = this.toggles.find(t => t.id === toggleId)
        if (toggle) {
          toggle.model = !toggle.model
          await this.setToggleSetting(toggleId, toggle.model)
        }
      }
    },
    
    async resetToDefault() {
      if (!this.isDeviceConnected) {
        // If not connected, just reset UI
      this.activeSensorMode = 1
      this.activeLiftOff = 1
      this.toggles.forEach(t => (t.model = false))
      this.pollingIndex = 0
      this.sleepTimerIndex = 2
        return
      }
      
      try {
        // Reset all settings to default on device
        await HIDHandle.Set_MS_SensorMode(1)           // High Power
        await HIDHandle.Set_MS_LOD(1.0)                // 1mm
        await HIDHandle.Set_MS_ReportRate(125)         // 125Hz
        await HIDHandle.Set_MS_Ripple(false)           // Off
        await HIDHandle.Set_MS_Angle(false)            // Off
        await HIDHandle.Set_MS_MotionSync(false)       // Off
        
        // Update UI
        this.isUpdatingFromDevice = true
        this.activeSensorMode = 1
        this.activeLiftOff = 2  // 1mm corresponds to id 2
        this.pollingIndex = 0
        this.sleepTimerIndex = 2
        this.toggles.forEach(t => (t.model = false))
        this.isUpdatingFromDevice = false
        
        console.log("🔄 All sensor settings reset to default")
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error("❌ Failed to reset settings:", error)
      }
    },
    
    toggleSleepDropdown() {
      this.sleepDropdownOpen = !this.sleepDropdownOpen
    },
    
    selectSleepTimer(index) {
      this.sleepTimerIndex = index
      this.sleepDropdownOpen = false
      // Note: Sleep timer functionality would need additional HIDHandle method
      if (this.isDeviceConnected) {
        console.log(`🕐 Sleep timer set to ${this.sleepTimer} minutes`)
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
  border-radius: 20px;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #666;
    color: #999;
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
  gap: 8px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
}

.dropdown-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  color: #a278fd;
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
  width: 120px;
  background: #262626;
  border-radius: 16px;
  z-index: 10;
  overflow: hidden;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  transform-origin: bottom center;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.4);
}

.sleep-dropdown-option {
  height: 56px;
  background: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #404040;
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
  border-radius: 10px;
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