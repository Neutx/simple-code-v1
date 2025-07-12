<template>
  <transition name="fade-slide-in" appear>
    <div class="dpi-control-bar">
      <!-- Top section with min/max labels -->
      <div class="dpi-range-labels">
        <span class="range-label min-label">100</span>
        <span class="range-label max-label">26000</span>
      </div>
      
      <!-- Main DPI slider track -->
      <div class="dpi-track">
        <div class="track-background"></div>
        
        <!-- DPI markers on the track -->
        <div 
          v-for="(profile, index) in activeDpiProfiles" 
          :key="`marker-${index}-${profile.dpi}-${profile.color.replace('#', '')}-max${maxDpiProfiles}-sel${selectedDpiIndex}`"
          class="dpi-marker"
          :style="{ 
            left: calculatePosition(profile.dpi, index),
            backgroundColor: profile.color,
            zIndex: index === selectedDpiIndex ? 100 : 50 + index
          }"
          :class="{ active: index === selectedDpiIndex }"
          @click="setActiveDPI(index)"
        ></div>
      </div>
      
      <!-- Bottom section with DPI value labels -->
      <div class="dpi-value-labels">
        <span 
          v-for="(profile, index) in activeDpiProfiles" 
          :key="`label-${index}-${profile.dpi}-${profile.color.replace('#', '')}-max${maxDpiProfiles}-sel${selectedDpiIndex}`"
          class="dpi-value-label"
          :style="{ 
            left: calculatePosition(profile.dpi, index),
            color: profile.color,
            zIndex: index === selectedDpiIndex ? 100 : 50 + index
          }"
          :class="{ 
            active: index === selectedDpiIndex
          }"
          @click="setActiveDPI(index)"
        >
          {{ profile.dpi }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'DPIControlBar',
  props: {
    dpiProfiles: {
      type: Array,
      default: () => [
        { dpi: 800, color: '#EF4444' },
        { dpi: 1200, color: '#10B981' },
        { dpi: 1600, color: '#FDE047' },
        { dpi: 1800, color: '#06B6D4' },
        { dpi: 2000, color: '#4F46E5' },
        { dpi: 5000, color: '#EC4899' },
        { dpi: 5400, color: '#64748B' },
        { dpi: 8000, color: '#F59E0B' }
      ]
    },
    maxDpiProfiles: {
      type: Number,
      default: 5
    },
    selectedDpiIndex: {
      type: Number,
      default: 0
    }
  },
  computed: {
    activeDpiProfiles() {
      // Simply slice the array based on maxDpiProfiles - maintain original order and indices
      const active = this.dpiProfiles.slice(0, this.maxDpiProfiles);
      console.log('🎯 Active DPI Profiles (showing ' + this.maxDpiProfiles + ' out of ' + this.dpiProfiles.length + '):', active);
      console.log('📊 Max profiles:', this.maxDpiProfiles, 'Selected:', this.selectedDpiIndex);
      console.log('🔍 All profiles:', this.dpiProfiles);
      
      // Log colors for debugging
      active.forEach((profile, index) => {
        console.log(`🎨 Profile ${index}: DPI ${profile.dpi}, Color ${profile.color}`);
      });
      
      // Additional validation
      if (active.length !== this.maxDpiProfiles) {
        console.warn('⚠️ Mismatch: Expected', this.maxDpiProfiles, 'profiles but got', active.length);
      }
      
      return active;
    },
    
    // Computed property to track color changes for reactivity
    profileColors() {
      return this.dpiProfiles.map(profile => profile.color);
    }
  },
  watch: {
    dpiProfiles: {
      handler(newProfiles, oldProfiles) {
        console.log('📊 DPI Control Bar: Profiles updated from', oldProfiles?.length || 0, 'to', newProfiles.length);
        
        // Log color changes specifically
        if (oldProfiles && newProfiles) {
          newProfiles.forEach((profile, index) => {
            if (oldProfiles[index] && oldProfiles[index].color !== profile.color) {
              console.log(`🎨 Color changed for profile ${index}: ${oldProfiles[index].color} → ${profile.color}`);
            }
          });
        }
        
        this.$forceUpdate();
      },
      deep: true,
      immediate: true
    },
    maxDpiProfiles: {
      handler(newMax, oldMax) {
        console.log('🔢 DPI Control Bar: Max profiles changed from', oldMax, 'to', newMax);
        console.log('📋 This should show exactly', newMax, 'markers on the bar');
        
        // Force immediate re-computation of activeDpiProfiles
        this.$nextTick(() => {
          console.log('✅ After update - Active profiles count:', this.activeDpiProfiles.length);
          this.$forceUpdate();
        });
      },
      immediate: true
    },
    selectedDpiIndex: {
      handler(newIndex, oldIndex) {
        console.log('👆 DPI Control Bar: Selected index changed from', oldIndex, 'to', newIndex);
        
        // Validate selection is within bounds
        if (newIndex >= this.maxDpiProfiles) {
          console.warn('⚠️ Selected index', newIndex, 'is beyond max profiles', this.maxDpiProfiles);
        }
      },
      immediate: true
    },
    // Watch the computed property directly for debugging
    activeDpiProfiles: {
      handler(newActive, oldActive) {
        console.log('🔄 Active DPI Profiles changed from', oldActive?.length || 0, 'to', newActive.length);
        console.log('📍 Current active profiles:', newActive.map(p => `${p.dpi} (${p.color})`));
      },
      immediate: true
    },
    
    // Watch for color changes specifically
    profileColors: {
      handler(newColors, oldColors) {
        console.log('🎨 Profile colors changed:', oldColors, '→', newColors);
        this.$forceUpdate();
      },
      immediate: true
    }
  },
  methods: {
    calculatePosition(dpi, index) {
      // Calculate base position based on DPI value
      const minDpi = 100;
      const maxDpi = 26000;
      
      // Apply padding
      const padding = 3;
      
      // Create array of all positions for collision detection
      const allPositions = [];
      
      // Calculate positions for all markers
      for (let i = 0; i < this.activeDpiProfiles.length; i++) {
        const profile = this.activeDpiProfiles[i];
        const profileClampedDpi = Math.max(minDpi, Math.min(maxDpi, profile.dpi));
        const profilePercentage = (profileClampedDpi - minDpi) / (maxDpi - minDpi);
        const profilePosition = padding + (profilePercentage * (100 - 2 * padding));
        
        allPositions.push({
          index: i,
          dpi: profile.dpi,
          position: profilePosition
        });
      }
      
      // Sort by position to handle overlaps
      allPositions.sort((a, b) => a.position - b.position);
      
      // Apply spacing adjustments
      const minDistance = 5; // Minimum distance between markers
      let adjustedPositions = [...allPositions];
      
      for (let i = 1; i < adjustedPositions.length; i++) {
        const current = adjustedPositions[i];
        const previous = adjustedPositions[i - 1];
        
        if (current.position - previous.position < minDistance) {
          current.position = previous.position + minDistance;
        }
      }
      
      // Find the adjusted position for the current index
      const currentMarker = adjustedPositions.find(item => item.index === index);
      const finalPosition = Math.max(padding, Math.min(95, currentMarker.position));
      
      console.log(`📍 DPI ${dpi} (index ${index}) positioned at ${finalPosition.toFixed(1)}%`);
      return `${finalPosition}%`;
    },
    
    setActiveDPI(index) {
      console.log('🎮 DPI Control Bar: Setting active DPI to index', index);
      this.$emit('dpi-changed', index);
    },
    
    // Debug method to verify synchronization
    debugSync() {
      console.log('🔍 DPI Control Bar Debug:');
      console.log('  - Max DPI Profiles prop:', this.maxDpiProfiles);
      console.log('  - Active profiles count:', this.activeDpiProfiles.length);
      console.log('  - All profiles count:', this.dpiProfiles.length);
      console.log('  - Selected index:', this.selectedDpiIndex);
      console.log('  - Active profiles:', this.activeDpiProfiles.map((p, i) => `${i}: ${p.dpi} (${p.color})`));
    }
  },
  
  mounted() {
    console.log('🚀 DPI Control Bar mounted');
    this.debugSync();
  },
  
  updated() {
    console.log('🔄 DPI Control Bar updated');
    this.debugSync();
  }
}
</script>

<style lang="scss" scoped>
.fade-slide-in-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-delay: 0.2s;
}

.fade-slide-in-enter {
  transform: translateX(30px);
  opacity: 0;
}

.dpi-control-bar {
  position: absolute;
  top: 12px;
  right: 0;
  width: clamp(800px, 80vw, 1127px);
  height: 96px;
  z-index: 15;
  pointer-events: auto;
}

.dpi-range-labels {
  position: relative;
  width: 100%;
  height: 20px;
  margin-bottom: 12px;
}

.range-label {
  position: absolute;
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  
  &.min-label {
    left: 8px;
  }
  
  &.max-label {
    right: 8px;
  }
}

.dpi-track {
  position: relative;
  width: calc(100% - 16px);
  height: 10px;
  margin: 0 8px 12px 8px;
}

.track-background {
  width: 100%;
  height: 100%;
  background: #27272A;
  border-radius: 20px;
}

.dpi-marker {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  &.active {
    width: 18px;
    height: 18px;
    border: 3px solid white;
    box-shadow: 0 0 0 2px rgba(162, 120, 253, 0.4), 0 4px 16px rgba(0, 0, 0, 0.5);
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.dpi-value-labels {
  position: relative;
  width: calc(100% - 16px);
  margin: 0 8px;
  height: 24px;
}

.dpi-value-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0.7;
  white-space: nowrap;
  
  &.active {
    font-weight: 600;
    opacity: 1;
    font-size: 18px;
    text-shadow: 0 0 8px currentColor;
  }
  
  &:hover {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }
}

// Responsive adjustments
@media (max-width: 1600px) {
  .dpi-control-bar {
    width: clamp(700px, 75vw, 950px);
  }
  
  .dpi-marker {
    width: 12px;
    height: 12px;
    
    &.active {
      width: 16px;
      height: 16px;
    }
  }
  
  .dpi-value-label {
    font-size: 14px;
    
    &.active {
      font-size: 16px;
    }
  }
}

@media (max-width: 1440px) {
  .dpi-control-bar {
    width: clamp(600px, 70vw, 850px);
  }
  
  .dpi-marker {
    width: 10px;
    height: 10px;
    
    &.active {
      width: 14px;
      height: 14px;
    }
  }
  
  .dpi-value-label {
    font-size: 13px;
    
    &.active {
      font-size: 15px;
    }
  }
}

@media (max-width: 1200px) {
  .dpi-control-bar {
    width: clamp(500px, 65vw, 750px);
  }
  
  .dpi-marker {
    width: 8px;
    height: 8px;
    
    &.active {
      width: 12px;
      height: 12px;
    }
  }
  
  .dpi-value-label {
    font-size: 12px;
    
    &.active {
      font-size: 14px;
    }
  }
}

@media (max-width: 1024px) {
  .dpi-control-bar {
    width: clamp(400px, 60vw, 650px);
  }
  
  .dpi-marker {
    width: 6px;
    height: 6px;
    
    &.active {
      width: 10px;
      height: 10px;
    }
  }
  
  .dpi-value-label {
    font-size: 11px;
    
    &.active {
      font-size: 13px;
    }
  }
}

@media (max-width: 768px) {
  .dpi-control-bar {
    width: clamp(300px, 55vw, 550px);
  }
  
  .dpi-marker {
    width: 4px;
    height: 4px;
    
    &.active {
      width: 8px;
      height: 8px;
    }
  }
  
  .dpi-value-label {
    font-size: 10px;
    
    &.active {
      font-size: 12px;
    }
  }
}
</style> 