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
        :dpi-profiles="dpiProfiles"
        :max-dpi-profiles="maxDpiProfiles"
        :selected-dpi-index="selectedDpiIndex"
        @dpi-changed="handleDPIChange"
      />
    </div>
    
    <!-- DPI Settings Sidebar Panel -->
    <DPISettingsPanel 
      :parent-dpi-profiles="dpiProfiles"
      :parent-max-dpi-profiles="maxDpiProfiles"
      :parent-selected-dpi-index="selectedDpiIndex"
      @dpi-profiles-updated="handleDpiProfilesUpdated"
      @max-profiles-changed="handleMaxProfilesChanged"
      @dpi-selected="handleDpiSelected"
      @dpi-value-changed="handleDpiValueChanged"
      @dpi-color-changed="handleDpiColorChanged"
      ref="dpiSettingsPanel"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HIDHandle from '@/assets/js/HIDHandle'
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
      selectedDpiIndex: 0,
      maxDpiProfiles: 4,
      dpiProfiles: [
        { dpi: 800, color: '#EF4444' },
        { dpi: 1200, color: '#10B981' },
        { dpi: 1600, color: '#FDE047' },
        { dpi: 1800, color: '#06B6D4' },
        { dpi: 2000, color: '#4F46E5' },
        { dpi: 5000, color: '#EC4899' },
        { dpi: 5400, color: '#64748B' },
        { dpi: 8000, color: '#F59E0B' }
      ]
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
  watch: {
    // Watch for changes in DPI profiles and force reactivity
    dpiProfiles: {
      handler(newProfiles) {
        // Force update of the control bar by creating a new array reference
        this.$forceUpdate();
        console.log('🔄 DPI Profiles updated:', newProfiles);
      },
      deep: true
    },
    maxDpiProfiles(newMax, oldMax) {
      console.log('📊 Max DPI Profiles changed:', oldMax, '→', newMax);
      this.$forceUpdate();
    },
    selectedDpiIndex(newIndex, oldIndex) {
      console.log('🎯 Selected DPI Index changed:', oldIndex, '→', newIndex);
    }
  },
  methods: {
    async handleDPIChange(dpiIndex) {
      console.log('🎮 DPI Control Bar: DPI changed to index', dpiIndex);
      this.selectedDpiIndex = dpiIndex;
      
      // Update device current DPI (like in the reference DpiSetting.vue)
      try {
        await HIDHandle.Set_MS_CurrentDPI(dpiIndex);
        console.log('✅ Current DPI updated on device from control bar:', dpiIndex);
        
        // Update device state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg) {
          HIDHandle.deviceInfo.mouseCfg.currentDpi = dpiIndex;
        }
        
        // Notify components about the change
        this.$bus.$emit("updateCurrentDPI", dpiIndex);
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
      } catch (error) {
        console.error('Error updating current DPI on device from control bar:', error);
      }
      
      // Notify the DPI Settings Panel about the change
      if (this.$refs.dpiSettingsPanel) {
        this.$refs.dpiSettingsPanel.updateSelectedDpi(dpiIndex);
      }
    },
    
    handleDpiProfilesUpdated(profiles) {
      console.log('📝 DPI Settings Panel: Profiles updated', profiles);
      // Create a new array to ensure reactivity
      this.dpiProfiles = [...profiles];
    },
    
    handleMaxProfilesChanged(maxProfiles) {
      console.log('🔢 DPI Settings Panel: Max profiles changed to', maxProfiles);
      this.maxDpiProfiles = maxProfiles;
      // If current selection is beyond new max, reset to first profile
      if (this.selectedDpiIndex >= maxProfiles) {
        this.selectedDpiIndex = 0;
      }
      
      // Force update to ensure control bar shows/hides markers immediately
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    
    handleDpiSelected(index) {
      console.log('👆 DPI Settings Panel: Profile selected', index);
      this.selectedDpiIndex = index;
    },
    
    handleDpiValueChanged({ index, value }) {
      console.log('🔧 DPI Settings Panel: DPI value changed', { index, value });
      // Update the specific profile's DPI value
      if (this.dpiProfiles[index]) {
        // Create a new array to ensure reactivity
        const newProfiles = [...this.dpiProfiles];
        newProfiles[index] = { ...newProfiles[index], dpi: value };
        this.dpiProfiles = newProfiles;
        
        // Force update to ensure control bar reacts immediately
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    },
    
    handleDpiColorChanged({ index, color }) {
      console.log('🎨 DPI Settings Panel: Color changed', { index, color });
      console.log('📊 Before update - Profile colors:', this.dpiProfiles.map(p => p.color));
      
      // Update the specific profile's color
      if (this.dpiProfiles[index]) {
        // Use Vue.set to ensure reactivity
        this.$set(this.dpiProfiles[index], 'color', color);
        
        // Also create a new array reference to trigger watchers
        this.dpiProfiles = [...this.dpiProfiles];
        
        console.log('✅ Color updated in parent state:', this.dpiProfiles[index]);
        console.log('📊 After update - Profile colors:', this.dpiProfiles.map(p => p.color));
        
        // Force update to ensure control bar reacts immediately
        this.$nextTick(() => {
          this.$forceUpdate();
          console.log('🔄 Forced update after color change');
          
          // Additional debugging
          console.log('🔍 Final state check - DPI profiles:', this.dpiProfiles);
        });
      }
    },
    
    getDeviceNameFromCidMid(cid, mid) {
      // Device identification logic
      // TODO: Implement device identification logic based on cid/mid
      // For now, return default until implementation is complete
      console.log('Device CID:', cid, 'MID:', mid); // Use parameters to avoid linter warning
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