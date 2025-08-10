<template>
  <transition name="fade-slide-in" appear>
    <div class="dpi-control-bar">
      <!-- Top section with min/max labels -->
      <div class="dpi-range-labels">
        <span class="range-label min-label">100</span>
        <span class="range-label max-label">{{ maxDpi }}</span>
      </div>
      
      <!-- Main DPI slider track -->
      <div class="dpi-track" @click="handleTrackClick">
        <div class="track-background"></div>
        
        <!-- DPI markers (use adjusted positions) -->
        <div 
          v-for="profile in positionedLabels" 
          :key="`marker-${profile.index}`"
          class="dpi-marker"
          :style="{ 
            left: profile.position + '%',
            backgroundColor: profile.color,
            zIndex: profile.index === selectedDpiIndex ? 10 : 5
          }"
          :class="{ active: profile.index === selectedDpiIndex }"
          @click.stop="setActiveDPI(profile.index)"
        ></div>
      </div>
      
      <!-- Bottom section with DPI value labels (already using adjusted positions) -->
      <div class="dpi-value-labels">
        <span 
          v-for="profile in positionedLabels" 
          :key="`label-${profile.index}`"
          class="dpi-value-label"
          :style="{ 
            left: profile.position + '%',
            color: profile.color,
            zIndex: profile.index === selectedDpiIndex ? 10 : 5
          }"
          :class="{ active: profile.index === selectedDpiIndex }"
          @click.stop="setActiveDPI(profile.index)"
        >
          {{ profile.value }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import { mapGetters } from 'vuex';

export default {
  name: 'DPIControlBar',
  data() {
    return {
      deviceInfo: HIDHandle.deviceInfo
    }
  },
  computed: {
    ...mapGetters('device', ['deviceModel']),
    isAnzuDevice() {
      return this.deviceModel && this.deviceModel.toLowerCase().includes('anzu');
    },
    maxDpi() {
      return this.isAnzuDevice ? 12000 : 26000;
    },
    dpiProfiles() {
      return this.deviceInfo?.mouseCfg?.dpis || [];
    },
    maxDpiProfiles() {
      return this.deviceInfo?.mouseCfg?.maxDpiStage || 0;
    },
    selectedDpiIndex() {
      return this.deviceInfo?.mouseCfg?.currentDpi || 0;
    },
    activeDpiProfiles() {
      if (!this.dpiProfiles.length || this.maxDpiProfiles === 0) {
        return [];
      }
      return this.dpiProfiles.slice(0, this.maxDpiProfiles);
    },
    positionedLabels() {
      const profiles = this.activeDpiProfiles;
      if (!profiles.length) return [];

      const minSpacing = 5; // Minimum 5% spacing between labels

      let labels = profiles.map((p, index) => ({
        ...p,
        index: index,
        position: this.calculatePercent(p.value)
      }));

      labels.sort((a, b) => a.position - b.position);

      for (let i = 1; i < labels.length; i++) {
        const prev = labels[i-1];
        const curr = labels[i];
        if (curr.position < prev.position + minSpacing) {
          curr.position = prev.position + minSpacing;
        }
      }

      // Clamp the last item to prevent it from going off-screen
      if (labels.length > 0) {
        const lastLabel = labels[labels.length - 1];
        if (lastLabel.position > 98) {
          lastLabel.position = 98;
          // Ripple backwards to adjust previous labels if needed
          for (let i = labels.length - 2; i >= 0; i--) {
            const next = labels[i+1];
            const curr = labels[i];
            if (curr.position > next.position - minSpacing) {
              curr.position = next.position - minSpacing;
            }
          }
        }
      }
      
      labels.sort((a, b) => a.index - b.index);

      return labels;
    }
  },
  methods: {
    calculatePercent(dpi) {
      const minDpi = 100;
      const maxDpi = this.maxDpi;
      const range = maxDpi - minDpi;
      return ((dpi - minDpi) / range) * 100;
    },
    calculatePosition(dpi) {
      return `${this.calculatePercent(dpi)}%`;
    },
    async setActiveDPI(index) {
      if (index >= 0 && index < this.maxDpi) {
        try {
          // Use the same method as DPISettingsPanel for consistency
          await HIDHandle.Set_MS_CurrentDPI(index);
          console.log('✅ [DPIControlBar] Set current DPI to index:', index);
          
          // Manually update reactive state for instant UI feedback
          if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg) {
            HIDHandle.deviceInfo.mouseCfg.currentDpi = index;
          }
          
          // Notify other components of the change using the same events as DPISettingsPanel
          this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
          this.$bus.$emit("updateCurrentDPI", index);
        } catch (error) {
          console.error('❌ [DPIControlBar] Error setting current DPI:', error);
        }
      }
    },
    handleTrackClick(event) {
      const track = event.currentTarget;
      const rect = track.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percent = (clickX / rect.width) * 100;
      
      const minDpi = 100;
      const maxDpi = this.maxDpi;
      const range = maxDpi - minDpi;
      const clickedDpi = Math.round((percent / 100) * range + minDpi);

      // Find the closest DPI profile to the clicked position
      let closestIndex = -1;
      let minDiff = Infinity;

      this.activeDpiProfiles.forEach((profile, index) => {
        const diff = Math.abs(profile.value - clickedDpi);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      if (closestIndex !== -1) {
        this.setActiveDPI(closestIndex);
      }
    }
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
  z-index: -1;
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