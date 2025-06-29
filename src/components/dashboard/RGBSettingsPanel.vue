<template>
  <div class="rgb-settings-wrapper">
    <transition name="slide-in" appear>
      <div class="rgb-settings-panel">
        <div class="panel-content">
          <!-- Header -->
          <div class="panel-header">
            <h1 class="panel-title">RGB</h1>
            <p class="panel-subtitle">Control your mice's light here</p>
          </div>

          <!-- Settings Controls -->
          <div class="settings-container">
          <!-- Light Toggle -->
          <div class="setting-row">
            <label class="setting-label">Light</label>
            <div
              class="toggle-switch"
              :class="{ checked: lightEnabled, disabled: !isDeviceConnected }"
              @click="toggleLight"
            >
              <div class="toggle-knob"></div>
            </div>
          </div>

          <!-- DPI Light Dropdown -->
          <div class="setting-row">
            <label class="setting-label">DPI Light</label>
            <div class="dropdown-container" @click="toggleDropdown">
              <span class="dropdown-value">{{ selectedMode }}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="dropdown-icon" :class="{ rotated: dropdownOpen }">
                <path d="M7 10L12 15L17 10" stroke="#D4D4D8" stroke-width="1.5" />
              </svg>
            </div>
            <!-- Dropdown Options -->
            <transition name="dropdown">
              <div v-if="dropdownOpen" class="dropdown-options">
                <div 
                  v-for="mode in lightModes" 
                  :key="mode"
                  class="dropdown-option"
                  @click.stop="selectMode(mode)"
                >
                  {{ mode }}
                </div>
              </div>
            </transition>
          </div>

          <!-- RGB Brightness Slider -->
          <div class="slider-section">
            <label class="slider-label">RGB brightness</label>
            <div class="slider-container">
              <div class="slider-track">
                <div class="slider-fill" :style="{ width: (brightness * 10) + '%' }"></div>
              </div>
              <div class="slider-numbers">
                <span
                  v-for="num in 10"
                  :key="num"
                  class="slider-number"
                  :class="{ active: num === brightness, disabled: !isDeviceConnected }"
                  @click="setBrightness(num)"
                >
                  {{ num }}
                </span>
              </div>
            </div>
          </div>

          <!-- RGB Speed Slider -->
          <div class="slider-section">
            <label class="slider-label">RGB speed</label>
            <div class="slider-container">
              <div class="slider-track">
                <div class="slider-fill" :style="{ width: (speed * 10) + '%' }"></div>
              </div>
              <div class="slider-numbers">
                <span
                  v-for="num in 10"
                  :key="num"
                  class="slider-number"
                  :class="{ active: num === speed, disabled: !isDeviceConnected }"
                  @click="setSpeed(num)"
                >
                  {{ num }}
                </span>
              </div>
            </div>
          </div>

          <!-- Color Picker -->
          <div class="color-section" @click="openColorPicker">
            <label class="color-label">Colour</label>
            <div class="color-picker">
              <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
            </div>
          </div>

          <!-- Reset Button -->
          <div class="reset-section">
            <button class="reset-button" @click="resetToDefault">
              <img src="/icons/resettodefault.svg" alt="Reset to default" class="reset-icon" />
              <span>Reset to default</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
  
  <!-- Color Picker Popup (outside transition) -->
  <ColorPicker 
    :visible="showColorPicker"
    :initial-color="selectedColor"
    @close="closeColorPicker"
    @color-selected="handleColorSelected"
  />
  

  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle'
import ColorPicker from './ColorPicker.vue'

export default {
  name: 'RGBSettingsPanel',
  components: {
    ColorPicker
  },
  data() {
    return {
      // Device info reference for real-time monitoring
      deviceInfo: HIDHandle.deviceInfo,
      
      lightEnabled: true,
      selectedMode: 'Rainbow',
      dropdownOpen: false,
      lightModes: ['Off', 'Rainbow', 'Single Color Breathe', 'Fixed Color', 'Neon', 'Rainbow Breath', 'Fixed Rainbow'],
      brightness: 1,
      speed: 1,
      selectedColor: '#a855f7',
      
      // Flag to prevent infinite loops during sync
      isUpdatingFromDevice: false,
      
      // Color picker state
      showColorPicker: false
    }
  },
  computed: {
    isDeviceConnected() {
      return this.deviceInfo.deviceOpen && this.deviceInfo.connectState === 2
    }
  },
  methods: {
    toggleLight() {
      if (!this.isDeviceConnected) return
      
      this.lightEnabled = !this.lightEnabled
      this.$emit('light-toggled', this.lightEnabled)
    },
    
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    
    selectMode(mode) {
      if (!this.isDeviceConnected) return
      
      this.selectedMode = mode
      this.dropdownOpen = false
      this.$emit('mode-changed', mode)
    },
    
    setBrightness(value) {
      if (!this.isDeviceConnected) return
      
      this.brightness = parseInt(value)
      this.$emit('brightness-changed', this.brightness)
    },
    
    setSpeed(value) {
      if (!this.isDeviceConnected) return
      
      this.speed = parseInt(value)
      this.$emit('speed-changed', this.speed)
    },
    
    openColorPicker() {
      if (!this.isDeviceConnected) {
        console.log('⚠️ Device not connected, opening color picker for demo')
      }
      
      this.showColorPicker = true
    },
    
    closeColorPicker() {
      this.showColorPicker = false
    },
    
    handleColorSelected(color) {
      this.selectedColor = color
      // Don't close automatically - let user close by clicking outside
      if (!this.isUpdatingFromDevice) {
        // Send color to device via HIDHandle if connected
        if (this.isDeviceConnected) {
          try {
            // Convert hex color to RGB values that HIDHandle expects
            const rgb = this.hexToRgb(color)
            if (rgb && typeof HIDHandle.Set_MS_LightColor === 'function') {
              HIDHandle.Set_MS_LightColor(rgb.r, rgb.g, rgb.b)
              console.log('🎨 RGB color sent to device:', color, rgb)
            }
          } catch (error) {
            console.error('❌ Error setting RGB color:', error)
          }
        }
        this.$emit('color-changed', color)
      }
    },
    
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    
    resetToDefault() {
      this.lightEnabled = true
      this.selectedMode = 'Rainbow'
      this.brightness = 1
      this.speed = 1
      this.selectedColor = '#a855f7'
      this.$emit('reset-to-default')
    }
  },
  watch: {
    selectedColor(newColor) {
      if (!this.isUpdatingFromDevice) {
        this.$emit('color-changed', newColor)
      }
    }
  },
  mounted() {
    if (this.isDeviceConnected) {
      console.log("🎨 RGB settings panel initialized")
    }
  }
}
</script>

<style lang="scss" scoped>
.rgb-settings-wrapper {
  position: relative;
}

.slide-in-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-in-enter {
  transform: translateX(-100%);
  opacity: 0;
}

.rgb-settings-panel {
  position: fixed;
  left: 3vw;
  top: calc(10vh + 80px);
  bottom: 100px;
  width: 384px;
  background: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 20;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.panel-content {
  width: 320px;
  position: absolute;
  left: 17px;
  top: 31px;
  bottom: 31px;
}

.panel-header {
  margin-bottom: 36px;
}

.panel-title {
  color: white;
  font-size: 30px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  margin: 0 0 12px 7px;
}

.panel-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  margin: 0 0 0 7px;
  line-height: 1.4;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  position: relative;
}

.setting-label {
  color: #d4d4d8;
  font-size: 20px;
  font-family: 'DM Sans', sans-serif;
  margin-left: 7px;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  width: 64px;
  height: 28px;
  background: #27272a;
  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.2s ease 0.2s;
  margin-right: 16px;

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
    width: 28px;
    height: 28px;
    top: 0;
    left: 0;
    background: #52525b;
    border-radius: 9999px;
    transition: transform 0.2s ease;
  }

  &.checked .toggle-knob {
    transform: translateX(36px);
    background: white;
  }
  
  &.disabled .toggle-knob {
    background: #444;
  }
  
  &.disabled.checked .toggle-knob {
    background: #888;
  }
}

/* Dropdown */
.dropdown-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  margin-right: 16px;
}

.dropdown-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  color: #a278fd;
}

.dropdown-icon {
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.dropdown-options {
  position: absolute;
  top: 100%;
  right: 0;
  width: 208px;
  background: #262626;
  border-radius: 16px;
  z-index: 10;
  overflow: hidden;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  transform-origin: top center;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.4);
}

.dropdown-option {
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

.slider-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-left: 8px;
}

.slider-container {
  position: relative;
  margin-left: 7px;
}

.slider-track {
  width: 320px;
  height: 6px;
  background: #27272a;
  border-radius: 8px;
  position: relative;
  margin-top: 49px;
}

.slider-fill {
  height: 100%;
  background: #a278fd;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.slider-numbers {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 320px;
  height: 56px;
  position: absolute;
  top: 0;
}

.slider-number {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
  opacity: 0.3;
  cursor: pointer;
  transition: opacity 0.2s ease;
  flex: 1;
  text-align: center;

  &:first-child {
    text-align: left;
  }

  &:last-child {
    text-align: right;
  }

  &.active {
    opacity: 1;
  }

  &.disabled {
    opacity: 0.2;
    cursor: not-allowed;
    color: #666;
  }

  &:hover:not(.disabled) {
    opacity: 0.7;
  }
}

.color-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
}

.color-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-left: 13px;
  cursor: pointer;
}

.color-picker {
  margin-right: 29px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #a278fd;
  }
}

.reset-section {
  margin-top: 8px;
}

.reset-button {
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

  &:hover {
    background: #3f3f46;
  }

  span {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: white;
  }
}

.reset-icon {
  width: 18px;
  height: 18px;
  filter: brightness(0) invert(1);
}

// Dropdown animation
.dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: top center;
}

.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  transform-origin: top center;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scaleY(0.7) translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8) translateY(-4px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}
</style> 