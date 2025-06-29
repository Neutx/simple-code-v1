<template>
  <div class="rgb-view">
    <!-- RGB Settings Panel (Left Side) - Fixed positioned -->
    <RGBSettingsPanel 
      @light-toggled="handleLightToggle"
      @mode-changed="handleModeChange"
      @brightness-changed="handleBrightnessChange"
      @speed-changed="handleSpeedChange"
      @color-changed="handleColorChange"
      @reset-to-default="handleResetToDefault"
    />

    <!-- Mouse Display (Center) -->
    <SensorMouseDisplay 
      :deviceModel="deviceModel"
      :mouseImageSrc="mouseImageSrc"
      :profileCount="4"
      :activeProfile="activeProfile"
      :currentDPI="currentDPI"
      :pollingRate="pollingRate"
      :batteryLevel="batteryLevel"
      @profile-selected="handleProfileSelected"
    />
  </div>
</template>

<script>
import RGBSettingsPanel from '@/components/dashboard/RGBSettingsPanel.vue'
import SensorMouseDisplay from '@/components/dashboard/SensorMouseDisplay.vue'
import HIDHandle from '@/assets/js/HIDHandle'

export default {
  name: 'RGBView',
  components: {
    RGBSettingsPanel,
    SensorMouseDisplay
  },
  data() {
    return {
      deviceModel: 'Ikarus',
      mouseImageSrc: '/mice/ikarus.svg',
      activeProfile: 1,
      deviceInfo: HIDHandle.deviceInfo
    }
  },
  computed: {
    currentDPI() {
      if (this.deviceInfo.mouseCfg && this.deviceInfo.mouseCfg.dpis && this.deviceInfo.mouseCfg.dpis[this.deviceInfo.mouseCfg.currentDpi]) {
        return this.deviceInfo.mouseCfg.dpis[this.deviceInfo.mouseCfg.currentDpi].value
      }
      return '420'
    },
    pollingRate() {
      return this.deviceInfo.mouseCfg?.reportRate || '4000'
    },
    batteryLevel() {
      return this.deviceInfo.battery?.level || '69'
    }
  },
  methods: {
    handleLightToggle(enabled) {
      console.log('🔦 Light toggled:', enabled)
      // Connect to HIDHandle for RGB light control
      if (HIDHandle.deviceInfo.deviceOpen) {
        try {
          // Toggle light state by calling Set_MS_LightMode with current mode
          // This function internally handles the state toggle
          const currentMode = HIDHandle.deviceInfo.mouseCfg.lightEffect?.mode || 0
          HIDHandle.Set_MS_LightMode(currentMode)
        } catch (error) {
          console.error('Failed to toggle light:', error)
        }
      }
    },
    
    handleModeChange(mode) {
      console.log('🌈 RGB mode changed:', mode)
      // Connect to HIDHandle for RGB mode change
      if (HIDHandle.deviceInfo.deviceOpen) {
        try {
          // Map mode names to HIDHandle mode values
          const modeMap = {
            'Rainbow': 0,
            'Breathing': 1,
            'Static': 2,
            'Wave': 3,
            'Ripple': 4,
            'Neon': 5
          }
          const modeValue = modeMap[mode] || 0
          HIDHandle.Set_MS_LightMode(modeValue)
        } catch (error) {
          console.error('Failed to change RGB mode:', error)
        }
      }
    },
    
    handleBrightnessChange(brightness) {
      console.log('💡 RGB brightness changed:', brightness)
      // Connect to HIDHandle for brightness control
      if (HIDHandle.deviceInfo.deviceOpen) {
        try {
          HIDHandle.Set_MS_LightBrightness(brightness - 1) // 0-9 range for HIDHandle
        } catch (error) {
          console.error('Failed to change brightness:', error)
        }
      }
    },
    
    handleSpeedChange(speed) {
      console.log('⚡ RGB speed changed:', speed)
      // Connect to HIDHandle for speed control
      if (HIDHandle.deviceInfo.deviceOpen) {
        try {
          HIDHandle.Set_MS_LightSpeed(speed - 1) // 0-9 range for HIDHandle
        } catch (error) {
          console.error('Failed to change speed:', error)
        }
      }
    },
    
    handleColorChange(color) {
      console.log('🎨 RGB color changed:', color)
      // Connect to HIDHandle for color control
      if (HIDHandle.deviceInfo.deviceOpen) {
        try {
          HIDHandle.Set_MS_LightColor(color)
        } catch (error) {
          console.error('Failed to change color:', error)
        }
      }
    },
    
    handleResetToDefault() {
      console.log('🔄 RGB settings reset to default')
      // Reset all RGB settings to default
      if (HIDHandle.deviceInfo.deviceOpen) {
        try {
          HIDHandle.Set_MS_LightMode(0) // Rainbow
          HIDHandle.Set_MS_LightBrightness(0) // Level 1
          HIDHandle.Set_MS_LightSpeed(0) // Level 1
          HIDHandle.Set_MS_LightColor('#a855f7')
        } catch (error) {
          console.error('Failed to reset RGB settings:', error)
        }
      }
    },
    
    handleProfileSelected(profileIndex) {
      this.activeProfile = profileIndex
      console.log('📋 Profile selected:', profileIndex)
      // Handle profile switching if needed
    }
  },
  mounted() {
    // Initialize RGB settings from device if connected
    if (HIDHandle.deviceInfo.deviceOpen) {
      console.log('🎮 RGB View loaded - Device connected')
    }
  }
}
</script>

<style lang="scss" scoped>
.rgb-view {
  width: 100%;
  height: 100%;
  position: relative;
}
</style> 