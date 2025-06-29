<template>
  <transition name="color-picker-fade">
    <div v-if="visible" class="color-picker-overlay" @click="handleOverlayClick">
      <div ref="colorPickerContainer" class="color-picker-container">
        <!-- Main Color Gradient Area -->
        <div 
          class="color-gradient" 
          :style="{ background: gradientBackground }"
          @mousedown="startGradientDrag"
          @click="handleGradientClick"
        >
          <div 
            class="gradient-pointer"
            :style="{ 
              left: saturationPosition + '%', 
              top: brightnessPosition + '%' 
            }"
          ></div>
        </div>
        
        <!-- Hue Slider -->
        <div class="slider-container" @mousedown="startHueDrag" @click="handleHueClick">
          <div class="hue-slider"></div>
          <div 
            class="slider-thumb" 
            :style="{ left: hueSliderPosition + '%' }"
          ></div>
        </div>
        
        <!-- Brightness Slider -->
        <div class="slider-container" @mousedown="startBrightnessDrag" @click="handleBrightnessClick">
          <div class="brightness-slider" :style="{ background: brightnessSliderBackground }"></div>
          <div 
            class="slider-thumb" 
            :style="{ left: brightnessSliderPosition + '%' }"
          ></div>
        </div>
        
        <!-- Color Input Section -->
        <div class="color-input-section">
          <!-- Current Color Preview -->
          <div class="current-color-preview">
            <div class="color-preview-square" :style="{ backgroundColor: currentColor }"></div>
          </div>
          <div class="eyedropper-button">
            <div class="eyedropper-icon">
              <div class="eyedropper-inner"></div>
            </div>
          </div>
          <div class="hex-input-container">
            <span class="hex-prefix">#</span>
            <input 
              type="text" 
              v-model="hexInput" 
              @input="handleHexInput"
              @keyup.enter="applyHexColor"
              placeholder="4F46E5"
              class="hex-input"
            />
          </div>
        </div>
        
        <!-- Saved Colors Label -->
        <div class="saved-colors-label">
          <span>Saved colors:</span>
        </div>
        
        <!-- Saved Colors Grid -->
        <div class="saved-colors-grid">
          <div class="saved-colors-row">
            <div 
              v-for="(color, index) in savedColorsRow1" 
              :key="'row1-' + index"
              class="color-swatch"
              :class="{ selected: currentColor === color }"
              :style="{ backgroundColor: color }"
              @click="selectSavedColor(color)"
            ></div>
          </div>
          <div class="saved-colors-row">
            <div 
              v-for="(color, index) in savedColorsRow2" 
              :key="'row2-' + index"
              class="color-swatch"
              :style="{ backgroundColor: color }"
              @click="selectSavedColor(color)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ColorPicker',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialColor: {
      type: String,
      default: '#a855f7'
    }
  },
  data() {
    return {
      // HSV color values
      hue: 0,           // 0-360
      saturation: 100,  // 0-100
      brightness: 50,   // 0-100 (value in HSV)
      
      // UI positions
      saturationPosition: 100,     // 0-100% for gradient X
      brightnessPosition: 50,      // 0-100% for gradient Y
      hueSliderPosition: 0,        // 0-100% for hue slider
      brightnessSliderPosition: 50, // 0-100% for brightness slider
      
      hexInput: '',
      currentColor: '',
      
      savedColorsRow1: [
        '#ef4444', '#f97316', '#facc15', '#4ade80', 
        '#2dd4bf', '#3b82f6', '#a855f7'
      ],
      savedColorsRow2: [
        '#ec4899', '#f43f5e', '#d946ef', '#6366f1', 
        '#0ea5e9', '#10b981', '#84cc16'
      ],
      
      isDragging: false,
      dragType: null,
      sliderRect: null  // Store the slider bounding rect
    }
  },
  computed: {
    gradientBackground() {
      const hueColor = `hsl(${this.hue}, 100%, 50%)`
      return `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${hueColor})`
    },
    
    brightnessSliderBackground() {
      const lightColor = `hsl(${this.hue}, ${this.saturation}%, 50%)`
      const darkColor = `hsl(${this.hue}, ${this.saturation}%, 0%)`
      return `linear-gradient(to right, ${darkColor}, ${lightColor})`
    }
  },
  watch: {
    initialColor: {
      immediate: true,
      handler(newColor) {
        if (newColor) {
          this.setColorFromHex(newColor)
        }
      }
    },
    
    visible(newVal) {
      if (newVal && this.initialColor) {
        this.setColorFromHex(this.initialColor)
      }
    }
  },
  methods: {
    // Handle overlay click - only close if clicking outside the color picker container
    handleOverlayClick(event) {
      // Get the color picker container element
      const container = this.$refs.colorPickerContainer
      if (!container) return
      
      // Check if the click is inside the container bounds
      const rect = container.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY
      
      // If click is outside the container bounds, close the popup
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        this.$emit('close')
      }
    },

    // Convert HSV to RGB
    hsvToRgb(h, s, v) {
      s /= 100
      v /= 100
      const c = v * s
      const x = c * (1 - Math.abs((h / 60) % 2 - 1))
      const m = v - c
      
      let r, g, b
      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c
      } else {
        r = c; g = 0; b = x
      }
      
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      }
    },
    
    // Convert RGB to HSV
    rgbToHsv(r, g, b) {
      r /= 255
      g /= 255
      b /= 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      
      let h = 0
      if (diff !== 0) {
        if (max === r) {
          h = ((g - b) / diff) % 6
        } else if (max === g) {
          h = (b - r) / diff + 2
        } else {
          h = (r - g) / diff + 4
        }
      }
      h = Math.round(h * 60)
      if (h < 0) h += 360
      
      const s = max === 0 ? 0 : Math.round((diff / max) * 100)
      const v = Math.round(max * 100)
      
      return { h, s, v }
    },
    
    // Convert RGB to Hex
    rgbToHex(r, g, b) {
      const toHex = (n) => {
        const hex = n.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    },
    
    // Convert Hex to RGB
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    
    // Update current color and emit
    updateColor() {
      const rgb = this.hsvToRgb(this.hue, this.saturation, this.brightness)
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b)
      this.currentColor = hex
      this.hexInput = hex.substring(1)
      this.$emit('color-selected', hex)
    },
    
    // Set color from hex value
    setColorFromHex(hex) {
      const rgb = this.hexToRgb(hex)
      if (!rgb) return
      
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b)
      this.hue = hsv.h
      this.saturation = hsv.s
      this.brightness = hsv.v
      
      this.updatePositions()
      this.currentColor = hex
      this.hexInput = hex.substring(1)
    },
    
    // Update UI positions based on HSV values
    updatePositions() {
      this.hueSliderPosition = (this.hue / 360) * 100
      this.saturationPosition = this.saturation
      this.brightnessPosition = 100 - this.brightness
      this.brightnessSliderPosition = this.brightness
    },
    
    // Gradient area interactions
    startGradientDrag(event) {
      event.preventDefault()
      this.isDragging = true
      this.dragType = 'gradient'
      this.sliderRect = event.currentTarget.getBoundingClientRect()
      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.stopDrag)
      this.updateGradientFromEvent(event)
    },
    
    handleGradientClick(event) {
      this.sliderRect = event.currentTarget.getBoundingClientRect()
      this.updateGradientFromEvent(event)
    },
    
    updateGradientFromEvent(event) {
      if (!this.sliderRect) return
      
      const x = event.clientX - this.sliderRect.left
      const y = event.clientY - this.sliderRect.top
      
      this.saturation = Math.max(0, Math.min(100, (x / this.sliderRect.width) * 100))
      this.brightness = Math.max(0, Math.min(100, 100 - (y / this.sliderRect.height) * 100))
      
      this.saturationPosition = this.saturation
      this.brightnessPosition = 100 - this.brightness
      this.brightnessSliderPosition = this.brightness
      
      this.updateColor()
    },
    
    // Hue slider interactions
    startHueDrag(event) {
      event.preventDefault()
      this.isDragging = true
      this.dragType = 'hue'
      this.sliderRect = event.currentTarget.getBoundingClientRect()
      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.stopDrag)
      this.updateHueFromEvent(event)
    },
    
    handleHueClick(event) {
      this.sliderRect = event.currentTarget.getBoundingClientRect()
      this.updateHueFromEvent(event)
    },
    
    updateHueFromEvent(event) {
      if (!this.sliderRect) return
      
      const x = event.clientX - this.sliderRect.left
      
      this.hue = Math.max(0, Math.min(360, (x / this.sliderRect.width) * 360))
      this.hueSliderPosition = (this.hue / 360) * 100
      
      this.updateColor()
    },
    
    // Brightness slider interactions
    startBrightnessDrag(event) {
      event.preventDefault()
      this.isDragging = true
      this.dragType = 'brightness'
      this.sliderRect = event.currentTarget.getBoundingClientRect()
      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.stopDrag)
      this.updateBrightnessFromEvent(event)
    },
    
    handleBrightnessClick(event) {
      this.sliderRect = event.currentTarget.getBoundingClientRect()
      this.updateBrightnessFromEvent(event)
    },
    
    updateBrightnessFromEvent(event) {
      if (!this.sliderRect) return
      
      const x = event.clientX - this.sliderRect.left
      
      this.brightness = Math.max(0, Math.min(100, (x / this.sliderRect.width) * 100))
      this.brightnessPosition = 100 - this.brightness
      this.brightnessSliderPosition = this.brightness
      
      this.updateColor()
    },
    
    // General drag handler
    handleDrag(event) {
      if (!this.isDragging || !this.sliderRect) return
      
      event.preventDefault()
      
      if (this.dragType === 'gradient') {
        this.updateGradientFromEvent(event)
      } else if (this.dragType === 'hue') {
        this.updateHueFromEvent(event)
      } else if (this.dragType === 'brightness') {
        this.updateBrightnessFromEvent(event)
      }
    },
    
    stopDrag() {
      this.isDragging = false
      this.dragType = null
      this.sliderRect = null
      document.removeEventListener('mousemove', this.handleDrag)
      document.removeEventListener('mouseup', this.stopDrag)
    },
    
    // Hex input handling
    handleHexInput() {
      // Remove any non-hex characters
      this.hexInput = this.hexInput.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6)
    },
    
    applyHexColor() {
      if (this.hexInput.length === 6) {
        this.setColorFromHex('#' + this.hexInput)
      }
    },
    
    // Saved color selection
    selectSavedColor(color) {
      this.setColorFromHex(color)
      this.$emit('color-selected', color)
    }
  },
  
  beforeDestroy() {
    // Clean up event listeners
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.stopDrag)
  }
}
</script>

<style lang="scss" scoped>
.color-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.color-picker-container {
  position: absolute;
  top: calc(10vh + 80px);
  left: calc(3vw + 384px + 20px);
  width: 256px;
  height: 384px;
  padding: 16px;
  background: rgba(64, 64, 64, 0.4);
  border-radius: 24px;
  box-shadow: 
    0px 4px 6px 0px rgba(31, 41, 55, 0.05),
    0px 10px 15px 0px rgba(31, 41, 55, 0.10);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-gradient {
  flex: 1;
  border-radius: 12px;
  position: relative;
  cursor: crosshair;
  user-select: none;
}

.gradient-pointer {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.slider-container {
  height: 8px;
  position: relative;
  border-radius: 100px;
  cursor: pointer;
  user-select: none;
}

.hue-slider {
  width: 100%;
  height: 8px;
  background: linear-gradient(to right, 
    #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, 
    #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%);
  border-radius: 100px;
}

.brightness-slider {
  width: 100%;
  height: 8px;
  border-radius: 100px;
}

.slider-thumb {
  width: 8px;
  height: 8px;
  position: absolute;
  top: 0;
  border-radius: 50%;
  background: white;
  box-shadow: 
    0px 4px 6px 0px rgba(31, 41, 55, 0.10),
    0px 2px 4px 0px rgba(31, 41, 55, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.1);
  transform: translateX(-50%);
  pointer-events: none;
}

.color-input-section {
  display: flex;
  gap: 8px;
}

.current-color-preview {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #404040;
  border-radius: 4px;
  border: 1px solid #555;
  box-shadow: 0px 1px 2px 0px rgba(31, 41, 55, 0.08);
}

.color-preview-square {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.1s ease;
}

.eyedropper-button {
  width: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.eyedropper-icon {
  flex: 1;
  height: 32px;
  padding: 6px;
  background: #404040;
  border-radius: 4px;
  box-shadow: 0px 1px 2px 0px rgba(31, 41, 55, 0.08);
  border: 1px solid #555;
  display: flex;
  justify-content: center;
  align-items: center;
}

.eyedropper-inner {
  width: 16px;
  height: 16px;
  background: #d1d5db;
}

.hex-input-container {
  flex: 1;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
}

.hex-prefix {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  pointer-events: none;
  z-index: 2;
}

.hex-input {
  width: 100%;
  height: 32px;
  padding: 4px 6px 4px 20px;
  background: #404040;
  border-radius: 5px;
  box-shadow: 0px 1px 2px 0px rgba(31, 41, 55, 0.08);
  border: 1px solid #555;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:focus {
    border-color: #a855f7;
  }
}

.saved-colors-label {
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: white;
    font-size: 12px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    line-height: 1;
  }
}

.saved-colors-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.saved-colors-row {
  display: flex;
  justify-content: space-between;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.selected {
    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.25);
    border: 2px solid white;
  }
}

// Transition animations
.color-picker-fade-enter-active,
.color-picker-fade-leave-active {
  transition: opacity 0.3s ease;
}

.color-picker-fade-enter-from,
.color-picker-fade-leave-to {
  opacity: 0;
}

.color-picker-fade-enter-to,
.color-picker-fade-leave-from {
  opacity: 1;
}
</style> 