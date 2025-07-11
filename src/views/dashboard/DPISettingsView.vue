<template>
  <div class="dpi-settings-view">
    <!-- Animated Mouse with expanded view -->
    <div class="mouse-section">
      <AnimatedMouseVisualization 
        :device-model="deviceModel"
        :mouse-image="mouseImageSrc"
        :is-d-p-i-mode="true"
      />
    </div>
    
    <!-- DPI Control Bar (centered right) -->
    <div class="dpi-control-section">
      <DPIControlBar 
        :active-d-p-i="activeDPI"
        @dpi-changed="handleDPIChange"
      />
    </div>
    
    <!-- DPI Settings Sidebar Panel -->
    <DPISettingsPanel />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AnimatedMouseVisualization from '@/components/dashboard/AnimatedMouseVisualization.vue'
import DPIControlBar from '@/components/dashboard/DPIControlBar.vue'
import DPISettingsPanel from '@/components/dashboard/DPISettingsPanel.vue'

export default {
  name: 'DPISettingsView',
  components: {
    AnimatedMouseVisualization,
    DPIControlBar,
    DPISettingsPanel
  },
  data() {
    return {
      activeDPI: 1 // Default to second profile (1200 DPI)
    }
  },
  computed: {
    ...mapGetters('device', ['deviceInfo']),
    
    deviceModel() {
      if (!this.deviceInfo) return 'Ikarus'
      
      if (this.deviceInfo.info && this.deviceInfo.info.cid && this.deviceInfo.info.mid) {
        return this.getDeviceNameFromCidMid(this.deviceInfo.info.cid, this.deviceInfo.info.mid)
      }
      
      if (this.deviceInfo.cid && this.deviceInfo.mid) {
        return this.getDeviceNameFromCidMid(this.deviceInfo.cid, this.deviceInfo.mid)
      }
      
      return 'Ikarus'
    },
    
    mouseImageSrc() {
      return '/mice/ikarus.svg'
    }
  },
  methods: {
    handleDPIChange(dpiIndex) {
      this.activeDPI = dpiIndex
      this.$emit('dpi-changed', dpiIndex)
    },
    
    getDeviceNameFromCidMid(cid, mid) {
      // Device identification logic
      // TODO: Implement device identification logic based on cid/mid
      // For now, return default until implementation is complete
       return 'Ikarus'
    },
    
    getDeviceInfo() {
      const cid = this.deviceInfo.info?.cid || 0
      const mid = this.deviceInfo.info?.mid || 0
      return { cid, mid }
    }
  }
}
</script>

<style lang="scss" scoped>
.dpi-settings-view {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.mouse-section {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  pointer-events: none;
}

.dpi-control-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
  pointer-events: none;
  
  // Adjust positioning to be offset to the right
  margin-left: 20vw;
  margin-top: -10vh;
}

// Responsive adjustments
@media (max-width: 1600px) {
  .dpi-control-section {
    margin-left: 18vw;
  }
}

@media (max-width: 1440px) {
  .dpi-control-section {
    margin-left: 16vw;
  }
}

@media (max-width: 1200px) {
  .dpi-control-section {
    margin-left: 14vw;
  }
}

@media (max-width: 1024px) {
  .dpi-control-section {
    margin-left: 12vw;
    margin-top: -8vh;
  }
}

@media (max-width: 768px) {
  .dpi-control-section {
    margin-left: 10vw;
    margin-top: -6vh;
  }
}
</style> 