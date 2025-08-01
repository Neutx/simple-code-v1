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
      :is-charging="isCharging"
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
    },
    isCharging() {
      return this.deviceInfo.battery?.charging || false
    },
    isDeviceConnected() {
      return HIDHandle.deviceInfo.deviceOpen
    }
  },
  methods: {
    async toggleLight(enabled) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_LightState(enabled ? 1 : 0)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Failed to toggle light:', error)
      }
    },

    async changeRGBMode(mode) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_LightMode(mode)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Failed to change RGB mode:', error)
      }
    },

    async changeBrightness(brightness) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_LightBrightness(brightness)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Failed to change brightness:', error)
      }
    },

    async changeSpeed(speed) {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_LightSpeed(speed)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Failed to change speed:', error)
      }
    },

    async changeColor(color) {
      if (!this.isDeviceConnected) return
      
      try {
        const rgb = this.hexToRgb(color)
        await HIDHandle.Set_MS_LightColor(rgb.r, rgb.g, rgb.b)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Failed to change color:', error)
      }
    },

    async resetToDefault() {
      if (!this.isDeviceConnected) return
      
      try {
        await HIDHandle.Set_MS_LightState(1)
        await HIDHandle.Set_MS_LightMode(0)
        await HIDHandle.Set_MS_LightBrightness(5)
        await HIDHandle.Set_MS_LightSpeed(5)
        await HIDHandle.Set_MS_LightColor(168, 85, 247)
        this.$bus.$emit("updateMouseUI", this.deviceInfo.mouseCfg)
      } catch (error) {
        console.error('Failed to reset RGB settings:', error)
      }
    },

    selectProfile(profileIndex) {
      this.activeProfile = profileIndex
      this.$emit('profile-selected', profileIndex)
    },

    handleLightToggle(enabled) {
      this.toggleLight(enabled)
    },
    
    handleModeChange(mode) {
      this.changeRGBMode(mode)
    },
    
    handleBrightnessChange(brightness) {
      this.changeBrightness(brightness)
    },
    
    handleSpeedChange(speed) {
      this.changeSpeed(speed)
    },
    
    handleColorChange(color) {
      this.changeColor(color)
    },
    
    handleResetToDefault() {
      this.resetToDefault()
    },
    
    handleProfileSelected(profileIndex) {
      this.selectProfile(profileIndex)
    }
  },
  mounted() {
    if (this.isDeviceConnected) {
      // Initialize RGB settings from device
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