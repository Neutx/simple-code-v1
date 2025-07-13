<template>
  <div class="sensor-view">
    <div class="sensor-header">
      <h1 class="sensor-title">Sensor Settings</h1>
      <p class="sensor-subtitle">Configure your mouse sensor performance and behavior</p>
    </div>

    <div class="sensor-content">
      <!-- Sensor Mode Section -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Sensor Mode</h3>
          <p>Select the optimal sensor mode for your usage</p>
        </div>
        <div class="setting-control">
          <select 
            v-model="sensorMode"
            @change="handleSensorModeChange"
            :disabled="corderMode"
            class="modern-select">
            <option 
              v-for="item in sensorModeOptions" 
              :key="item.value" 
              :value="item.value"
              :disabled="item.value == 256">
              {{item.option}}
            </option>
          </select>
          <div v-if="corderMode" class="corded-indicator">
            <span>🔌 Corded Mode Active</span>
          </div>
        </div>
      </div>

      <!-- LOD (Lift-off Distance) Section -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Lift-off Distance (LOD)</h3>
          <p>Adjust how high you can lift the mouse before tracking stops</p>
        </div>
        <div class="setting-control">
          <div class="lod-options">
            <div 
              v-for="item in lodOptions" 
              :key="item.value"
              class="lod-option"
              :class="{ active: lod === item.value }"
              @click="handleLODClick(item.value)">
              <span class="lod-value">{{item.option}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Section -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Highest Performance Mode</h3>
          <p>Enable maximum performance with customizable sleep timer duration</p>
        </div>
        <div class="setting-control">
          <div class="performance-toggle">
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="performanceState"
                @change="handlePerformanceStateChange">
              <span class="slider"></span>
            </label>
            <span class="toggle-label">
              {{ performanceState ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <!-- Sleep Timer Selection -->
          <div v-if="performanceState" class="sleep-timer-section">
            <label class="sleep-timer-label">Sleep Timer Duration ({{ performanceOptions.length }} options):</label>
            <div class="sleep-timer-grid">
              <div 
                v-for="option in performanceOptions" 
                :key="option.value"
                class="sleep-timer-option"
                :class="{ active: performance === option.value }"
                @click="handleSleepTimerClick(option.value)"
                :title="`Value: ${option.value}, Option: ${option.option}`">
                <span class="timer-value">{{ option.option }}</span>
              </div>
            </div>
            <div class="current-timer-display">
              <span>Current: <strong>{{ getCurrentTimerText() }}</strong></span>
            </div>
            <div class="debug-info" style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
              Available options: {{ performanceOptions.map(p => p.option).join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings Section -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Advanced Sensor Settings</h3>
          <p>Fine-tune sensor behavior and motion processing</p>
        </div>
        <div class="setting-control">
          <div class="advanced-switches">
            <div class="switch-item">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="ripple"
                  @change="handleRippleClick">
                <span class="slider"></span>
              </label>
              <div class="switch-info">
                <span class="switch-title">Ripple Control</span>
                <span class="switch-desc">Reduces sensor ripple for smoother tracking</span>
              </div>
            </div>

            <div class="switch-item">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="angle"
                  @change="handleAngleClick">
                <span class="slider"></span>
              </label>
              <div class="switch-info">
                <span class="switch-title">Angle Snap</span>
                <span class="switch-desc">Corrects slight deviations in straight lines</span>
              </div>
            </div>

            <div class="switch-item">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="motionSync"
                  @change="handleMotionSyncClick">
                <span class="slider"></span>
              </label>
              <div class="switch-info">
                <span class="switch-title">Motion Sync</span>
                <span class="switch-desc">Synchronizes motion processing for enhanced precision</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Status Display -->
      <div class="setting-card status-card">
        <div class="setting-header">
          <h3>Current Sensor Status</h3>
          <p>Live sensor configuration and connection status</p>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Connection</span>
            <span class="status-value" :class="connectionStatus.class">
              {{ connectionStatus.text }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Sensor Mode</span>
            <span class="status-value">{{ currentSensorModeText }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">LOD</span>
            <span class="status-value">{{ currentLODText }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Performance</span>
            <span class="status-value">{{ performanceStatus }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import en from '@/assets/en.json';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'SensorView',
  data() {
    return {
      // Language and Device Info
      language: en,
      info: HIDHandle.deviceInfo,
      
      // UI state flags
      isUpdatingFromDevice: false,
      isUpdatingFromVuex: false,
      isInitializing: false // Add a flag to block incoming updates during component mount
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

    // Sensor mode options from language file
    sensorModeOptions() {
      return this.language.SensorModeOptions;
    },

    // LOD options from language file
    lodOptions() {
      return this.language.LODOptions;
    },

    // Performance/Sleep timer options
    performanceOptions() {
      return [
        { value: 1, option: "10sec" },
        { value: 3, option: "30sec" },
        { value: 6, option: "1min" },
        { value: 30, option: "5min" },
        { value: 60, option: "10min" },
        { value: 90, option: "15min" },
        { value: 120, option: "20min" },
        { value: 150, option: "25min" },
        { value: 180, option: "30min" },
        { value: 210, option: "35min" },
        { value: 240, option: "40min" }
      ];
    },

    // Connection status from device info
    connectionStatus() {
      if (!this.info.deviceOpen) {
        return { text: 'Disconnected', class: 'status-disconnected' };
      }
      if (this.info.connectState === 2) {
        return { text: 'Connected', class: 'status-connected' };
      }
      if (this.info.connectState === 1) {
        return { text: 'Connecting...', class: 'status-connecting' };
      }
      return { text: 'Unknown', class: 'status-unknown' };
    },

    // Current sensor mode text from Vuex state
    currentSensorModeText() {
      const mode = this.sensorModeOptions.find(m => m.value === this.sensorMode);
      return mode ? mode.option : 'Unknown';
    },

    // Current LOD text from Vuex state
    currentLODText() {
      const lodOption = this.lodOptions.find(l => l.value === this.sensorLOD);
      return lodOption ? lodOption.option : 'Unknown';
    },

    // Performance status from Vuex state
    performanceStatus() {
      if (!this.sensorPerformanceState) return 'Disabled';
      const perfOption = this.performanceOptions.find(p => p.value === this.sensorSleepTimer);
      return perfOption ? `Active (${perfOption.option})` : 'Active';
    },

    // Device connection status
    isDeviceConnected() {
      return this.info.deviceOpen && this.info.connectState === 2;
    },

    // Corded mode status
    corderMode() {
      return this.sensorPollingRate > 1000;
    },

    // Last sensor mode for corded mode switching
    lastSensorMode() {
      return this.sensorMode === 256 ? 0 : this.sensorMode; // Default to Low Power if currently in Corded
    }
  },

  methods: {
    ...mapActions('settings', [
      'setSensorMode',
      'setSensorLOD',
      'setSensorPerformanceState',
      'setSensorPerformance',
      'setSensorRipple',
      'setSensorAngle',
      'setSensorMotionSync',
      'setSensorSleepTimer',
      'saveSettingsToLocalStorage',
      'loadSettingsFromLocalStorage'
    ]),

    // Sync methods to send data to the device. They no longer emit events.
    async syncSensorModeToDevice(mode) {
      if (!this.isDeviceConnected) return;
      try { await HIDHandle.Set_MS_SensorMode(mode); }
      catch (error) { console.error("Failed to sync sensor mode:", error); }
    },
    async syncLODToDevice(lod) {
      if (!this.isDeviceConnected) return;
      try { await HIDHandle.Set_MS_LOD(lod); }
      catch (error) { console.error("Failed to sync LOD:", error); }
    },
    async syncPerformanceStateToDevice(state) {
      if (!this.isDeviceConnected) return;
      try { await HIDHandle.Set_MS_PerformanceState(state ? 1 : 0); }
      catch (error) { console.error("Failed to sync performance state:", error); }
    },
    async syncPerformanceToDevice(performance) {
      if (!this.isDeviceConnected) return;
      try { await HIDHandle.Set_MS_LightOffTime(performance); }
      catch (error) { console.error("Failed to sync performance/sleep:", error); }
    },
    async syncRippleToDevice(enabled) {
      if (!this.isDeviceConnected) return;
      try { await HIDHandle.Set_MS_Ripple(enabled ? 1 : 0); }
      catch (error) { console.error("Failed to sync ripple:", error); }
    },
    async syncAngleToDevice(enabled) {
      if (!this.isDeviceConnected) return;
      try { await HIDHandle.Set_MS_Angle(enabled ? 1 : 0); }
      catch (error) { console.error("Failed to sync angle:", error); }
    },
         async syncMotionSyncToDevice(enabled) {
       if (!this.isDeviceConnected) return;
       try { await HIDHandle.Set_MS_MotionSync(enabled ? 1 : 0); }
       catch (error) { console.error("Failed to sync motion sync:", error); }
     },
     async syncSleepTimerToDevice(timer) {
       if (!this.isDeviceConnected) return;
       try { await HIDHandle.Set_MS_LightOffTime(timer); }
       catch (error) { console.error("Failed to sync sleep timer:", error); }
     },

    // UI Handlers: These now ONLY commit to Vuex state.
    handleSensorModeChange() { this.setSensorMode(this.sensorMode); },
    handleLODClick(value) { this.setSensorLOD(value); },
    handlePerformanceStateChange() { this.setSensorPerformanceState(this.sensorPerformanceState); },
         handleSleepTimerClick(value) { this.setSensorSleepTimer(value); },
    handleRippleClick() { this.setSensorRipple(!this.sensorRipple); },
    handleAngleClick() { this.setSensorAngle(!this.sensorAngle); },
    handleMotionSyncClick() { this.setSensorMotionSync(!this.sensorMotionSync); },

    // Utility and Initialization
    initializeFromVuex() { this.loadSettingsFromLocalStorage(); },
         getCurrentTimerText() {
       const option = this.performanceOptions.find(p => p.value === this.sensorSleepTimer);
       return option ? option.option : 'Unknown';
     },
    syncSensorFromDevice(sensor) {
      if (!sensor) return;
      this.isUpdatingFromDevice = true;
      try {
                 const settings = {
           sensorMode: sensor.sensorMode,
           lod: sensor.lod,
           performanceState: Boolean(sensor.performanceState),
           performance: sensor.performance,
           sleepTimer: sensor.performance, // Map device performance to sleepTimer
           ripple: Boolean(sensor.ripple),
           angle: Boolean(sensor.angle),
           motionSync: Boolean(sensor.motionSync)
         };
        this.$store.commit('settings/UPDATE_SENSOR_SETTINGS', settings);
        this.saveSettingsToLocalStorage();
      } catch (error) {
        console.error('Error syncing from device:', error);
      } finally {
        this.isUpdatingFromDevice = false;
      }
    },
    async applyVuexSettingsToDevice() {
      if (!this.isDeviceConnected) return;
             try {
         await this.syncSensorModeToDevice(this.sensorMode);
         await this.syncLODToDevice(this.sensorLOD);
         await this.syncPerformanceStateToDevice(this.sensorPerformanceState);
         await this.syncPerformanceToDevice(this.sensorPerformance);
         await this.syncSleepTimerToDevice(this.sensorSleepTimer);
         await this.syncRippleToDevice(this.sensorRipple);
         await this.syncAngleToDevice(this.sensorAngle);
         await this.syncMotionSyncToDevice(this.sensorMotionSync);
       } catch (error) {
        console.error('Error applying Vuex settings to device:', error);
      }
    }
  },

  watch: {
    // Watchers now handle BOTH device sync and persistence.
    sensorMode(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncSensorModeToDevice(newVal);
        this.saveSettingsToLocalStorage();
      }
    },
    sensorLOD(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncLODToDevice(newVal);
        this.saveSettingsToLocalStorage();
      }
    },
    sensorPerformanceState(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncPerformanceStateToDevice(newVal);
        this.saveSettingsToLocalStorage();
      }
    },
    sensorPerformance(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncPerformanceToDevice(newVal);
        this.saveSettingsToLocalStorage();
      }
    },
    sensorRipple(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncRippleToDevice(newVal);
        this.saveSettingsToLocalStorage();
      }
    },
    sensorAngle(newVal, oldVal) {
      if (oldVal !== undefined && !this.isUpdatingFromDevice) {
        this.syncAngleToDevice(newVal);
        this.saveSettingsToLocalStorage();
      }
    },
         sensorMotionSync(newVal, oldVal) {
       if (oldVal !== undefined && !this.isUpdatingFromDevice) {
         this.syncMotionSyncToDevice(newVal);
         this.saveSettingsToLocalStorage();
       }
     },
     sensorSleepTimer(newVal, oldVal) {
       if (oldVal !== undefined && !this.isUpdatingFromDevice) {
         this.syncSleepTimerToDevice(newVal);
         this.saveSettingsToLocalStorage();
       }
     },

    // Watch device changes and sync to Vuex ONLY if no saved settings exist.
    "info.mouseCfg.sensor": {
      handler(newSensor) {
        // Only sync from device if we're not initializing and have no persisted settings
        const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
        if (this.isInitializing || !newSensor || this.isUpdatingFromDevice || hasPersistedSettings) {
          return;
        }
        this.syncSensorFromDevice(newSensor);
      },
      deep: true,
      immediate: false
    },
    "info.deviceOpen": {
      handler(isOpen) {
        if (!isOpen) return; // Only act when the device connects

        // After connection, check if we have saved settings.
        const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
        if (hasPersistedSettings) {
          // If we have saved settings, re-apply them to the device to ensure it's in sync.
          console.log("Device connected. Applying persisted settings.");
          this.applyVuexSettingsToDevice();
        } else if (this.info.mouseCfg && this.info.mouseCfg.sensor) {
          // If there are no saved settings, read the configuration from the device.
          console.log("Device connected. No persisted settings found. Syncing from device.");
          this.syncSensorFromDevice(this.info.mouseCfg.sensor);
        }
      }
    }
  },

  mounted() {
    this.isInitializing = true;

    // Initialize from Vuex store first (loads from localStorage)
    this.initializeFromVuex();

    // Check if we have persisted settings and device is connected
    const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
    
    if (this.info.deviceOpen && hasPersistedSettings) {
      // Apply persisted Vuex settings to device
      this.applyVuexSettingsToDevice()
    } else if (this.info.deviceOpen && this.info.mouseCfg && this.info.mouseCfg.sensor) {
      // Only sync from device if no persisted settings
      this.syncSensorFromDevice(this.info.mouseCfg.sensor);
    }

    // Listen for mouse UI updates
    this.$bus.$on("updateMouseUI", cfg => {
      // If we are initializing, ignore incoming updates to prevent reverting state
      if (this.isInitializing) return;

      const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
      if (cfg.sensor && !this.isUpdatingFromDevice && !hasPersistedSettings) {
        this.syncSensorFromDevice(cfg.sensor);
      }
    });

    // Listen for device info updates
    this.$bus.$on("updateDeviceInfo", info => {
      const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
      if (!hasPersistedSettings) {
        this.setWiredDevice(info.isWired);
        
        if (info.isWired) {
          this.setCorderMode(true);
        }
      }
    });

    // Listen for sensor mode updates
    this.$bus.$on("updateSensorMode", value => {
      const hasPersistedSettings = localStorage.getItem('kreo_sensor_settings')
      if (!hasPersistedSettings) {
        if (this.isWiredDevice) {
          this.setCorderMode(true);
        } else {
          this.setCorderMode(value);
        }
      }
    });

    // End the initialization phase after a short delay
    setTimeout(() => {
      this.isInitializing = false;
    }, 1500); // 1.5 second quiet period
  },

  beforeDestroy() {
    // Clean up event listeners
    this.$bus.$off("updateMouseUI");
    this.$bus.$off("updateDeviceInfo");
    this.$bus.$off("updateSensorMode");
  }
}
</script>

<style lang="scss" scoped>
.sensor-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.sensor-header {
  text-align: center;
  margin-bottom: 3rem;
  
  .sensor-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .sensor-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }
}

.sensor-content {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.setting-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  }
}

.setting-header {
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    opacity: 0.8;
    margin: 0;
    font-size: 0.9rem;
  }
}

.modern-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #32A07E;
    box-shadow: 0 0 0 3px rgba(50, 160, 126, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  option {
    background: #2a2a2a;
    color: white;
  }
}

.corded-indicator {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

.lod-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.lod-option {
  padding: 1rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 80px;
  
  &:hover {
    border-color: #32A07E;
    transform: translateY(-2px);
  }
  
  &.active {
    background: #32A07E;
    border-color: #32A07E;
    box-shadow: 0 4px 12px rgba(50, 160, 126, 0.4);
  }
  
  .lod-value {
    font-weight: 600;
    font-size: 1.1rem;
  }
}

.performance-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  
  input {
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
    background-color: rgba(255, 255, 255, 0.3);
    transition: 0.3s;
    border-radius: 30px;
    
    &:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + .slider {
    background-color: #32A07E;
  }
  
  input:checked + .slider:before {
    transform: translateX(30px);
  }
}

.toggle-label {
  font-weight: 500;
}

.sleep-timer-section {
  margin-top: 1.5rem;
  
  .sleep-timer-label {
    display: block;
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: 1rem;
  }
}

.sleep-timer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.sleep-timer-option {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  
  &:hover {
    border-color: #32A07E;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(50, 160, 126, 0.2);
  }
  
  &.active {
    background: #32A07E;
    border-color: #32A07E;
    box-shadow: 0 4px 12px rgba(50, 160, 126, 0.4);
    
    .timer-value {
      color: white;
      font-weight: 600;
    }
  }
  
  .timer-value {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
  }
}

.current-timer-display {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.95rem;
  
  strong {
    color: #32A07E;
  }
}

.advanced-switches {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.switch-info {
  display: flex;
  flex-direction: column;
  
  .switch-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .switch-desc {
    font-size: 0.85rem;
    opacity: 0.8;
  }
}

.status-card {
  grid-column: 1 / -1;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.status-label {
  font-weight: 500;
  opacity: 0.8;
}

.status-value {
  font-weight: 600;
  
  &.status-connected {
    color: #28a745;
  }
  
  &.status-connecting {
    color: #ffc107;
  }
  
  &.status-disconnected {
    color: #dc3545;
  }
  
  &.status-unknown {
    color: #6c757d;
  }
}

@media (max-width: 768px) {
  .sensor-content {
    grid-template-columns: 1fr;
  }
  
  .lod-options {
    flex-direction: column;
    align-items: center;
  }
  
  .switch-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style> 