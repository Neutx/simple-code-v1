<template>
  <div class="dpi-settings-panel" :class="{ 'panel-visible': isVisible }">
    <div class="panel-content">
      <!-- Header Section -->
      <div class="panel-header">
        <h2 class="panel-title">DPI</h2>
        <p class="panel-description">
          Change your mice's sensitivity here. You can also add one by clicking on the slider.
        </p>
      </div>

      <!-- DPI Light Section -->
      <div class="dpi-light-section">
        <div class="section-row">
          <span class="section-label">DPI Light</span>
          <div class="dropdown-container">
            <span class="dropdown-value">Steady</span>
            <IconifyIcon icon="mdi:chevron-down" class="dropdown-icon" />
          </div>
        </div>
      </div>

      <!-- DPI Light Brightness -->
      <div class="slider-section">
        <h3 class="slider-title">DPI light brightness</h3>
        <div class="slider-container">
          <div class="slider-track">
            <div class="slider-fill" :style="{ width: brightnessPercentage + '%' }"></div>
          </div>
          <div class="slider-numbers">
            <span v-for="num in 10" :key="num" 
                  :class="{ active: num === brightness }"
                  @click="setBrightness(num)">
              {{ num }}
            </span>
          </div>
        </div>
      </div>

      <!-- DPI Light Speed -->
      <div class="slider-section">
        <h3 class="slider-title">DPI light speed</h3>
        <div class="slider-container">
          <div class="slider-track">
            <div class="slider-fill" :style="{ width: speedPercentage + '%' }"></div>
          </div>
          <div class="slider-numbers">
            <span v-for="num in 10" :key="num" 
                  :class="{ active: num === speed }"
                  @click="setSpeed(num)">
              {{ num }}
            </span>
          </div>
        </div>
      </div>

      <!-- Max DPI Profiles -->
      <div class="profiles-section">
        <h3 class="section-title">Max DPI profiles</h3>
        
        <!-- Profile Selector -->
        <div class="profile-selector">
          <span>{{ selectedProfile }}</span>
        </div>

        <!-- DPI Profile List -->
        <div class="dpi-profiles">
          <div v-for="(profile, index) in dpiProfiles" 
               :key="index"
               class="dpi-profile"
               :class="{ active: profile.active }">
            <span class="dpi-value">{{ profile.value }}</span>
            <div class="profile-actions">
              <div class="color-indicator" :style="{ backgroundColor: profile.color }"></div>
              <IconifyIcon icon="mdi:dots-vertical" class="options-icon" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="action-btn">
            <IconifyIcon icon="mdi:plus" />
            Add a DPI
          </button>
          <button class="action-btn">
            <IconifyIcon icon="mdi:restore" />
            Reset to default
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DPISettings',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      brightness: 1,
      speed: 1,
      selectedProfile: 1,
      dpiProfiles: [
        { value: 800, color: '#ef4444', active: false },
        { value: 1200, color: '#22c55e', active: true },
        { value: 1600, color: '#eab308', active: false },
        { value: 1800, color: '#06b6d4', active: false },
        { value: 2000, color: '#3730a3', active: false },
        { value: 5000, color: '#d946ef', active: false },
        { value: 5400, color: '#64748b', active: false }
      ]
    }
  },
  computed: {
    brightnessPercentage() {
      return (this.brightness / 10) * 100
    },
    speedPercentage() {
      return (this.speed / 10) * 100
    }
  },
  methods: {
    setBrightness(value) {
      this.brightness = value
    },
    setSpeed(value) {
      this.speed = value
    }
  }
}
</script>

<style lang="scss" scoped>
.dpi-settings-panel {
  position: fixed;
  top: 0;
  left: -400px;
  width: 384px;
  height: 100vh;
  background: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 0 24px 24px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 50;
  transition: left 0.3s ease;
  overflow: hidden;

  &.panel-visible {
    left: 0;
  }
}

.panel-content {
  padding: 48px 24px 24px;
  height: 100%;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.panel-header {
  margin-bottom: 32px;
}

.panel-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
}

.panel-description {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.4;
}

.dpi-light-section {
  margin-bottom: 32px;
}

.section-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.section-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  color: #d1d5db;
}

.dropdown-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.dropdown-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  color: #a855f7;
}

.dropdown-icon {
  color: #d1d5db;
  font-size: 24px;
}

.slider-section {
  margin-bottom: 32px;
}

.slider-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0 0 16px 0;
}

.slider-container {
  position: relative;
}

.slider-track {
  width: 100%;
  height: 6px;
  background: #404040;
  border-radius: 3px;
  margin-bottom: 40px;
  position: relative;
}

.slider-fill {
  height: 100%;
  background: #a855f7;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.slider-numbers {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    min-width: 24px;
    text-align: center;
    
    &.active {
      color: white;
    }
    
    &:hover {
      color: white;
    }
  }
}

.profiles-section {
  margin-bottom: 32px;
}

.section-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0 0 16px 0;
}

.profile-selector {
  width: 100%;
  height: 56px;
  background: #525252;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  
  span {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: white;
  }
}

.dpi-profiles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.dpi-profile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 24px;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.dpi-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 5px;
}

.options-icon {
  color: #d1d5db;
  font-size: 20px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 48px;
  background: #404040;
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #525252;
  }
  
  svg {
    font-size: 18px;
  }
}
</style> 