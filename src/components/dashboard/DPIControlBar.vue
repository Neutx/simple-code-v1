<template>
  <transition name="fade-slide-in" appear>
    <div class="dpi-control-bar">
      <!-- Top section with min/max labels -->
      <div class="dpi-range-labels">
        <span class="range-label min-label">100</span>
        <span class="range-label max-label">8000</span>
      </div>
      
      <!-- Main DPI slider track -->
      <div class="dpi-track">
        <div class="track-background"></div>
        
        <!-- DPI markers on the track -->
        <div 
          v-for="(profile, index) in dpiProfiles" 
          :key="index"
          class="dpi-marker"
          :style="{ 
            left: getMarkerPosition(profile.dpi),
            backgroundColor: profile.color 
          }"
          :class="{ active: index === activeDPI }"
          @click="setActiveDPI(index)"
        ></div>
      </div>
      
      <!-- Bottom section with DPI value labels -->
      <div class="dpi-value-labels">
        <span 
          v-for="(profile, index) in dpiProfiles" 
          :key="index"
          class="dpi-value-label"
          :style="{ 
            left: getMarkerPosition(profile.dpi),
            color: profile.color 
          }"
          :class="{ 
            active: index === activeDPI,
            underlined: index === activeDPI 
          }"
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
    activeDPI: {
      type: Number,
      default: 1 // Default to second profile (1200)
    }
  },
  data() {
    return {
      dpiProfiles: [
        { dpi: 100, color: '#EF4444', left: '8px' },   // red
        { dpi: 1200, color: '#10B981', left: '185px' },  // green
        { dpi: 1600, color: '#FDE047', left: '272px' },  // yellow
        { dpi: 1800, color: '#06B6D4', left: '319px' },  // cyan
        { dpi: 2000, color: '#5d43bd', left: '491px' },  // indigo
        { dpi: 5000, color: '#EC4899', left: '637px' },  // pink
        { dpi: 5400, color: '#64748B', left: '812px' }   // slate
      ]
    }
  },
  methods: {
    getMarkerPosition(dpi) {
      // Find the profile with matching DPI
      const profile = this.dpiProfiles.find(p => p.dpi === dpi);
      return profile ? profile.left : '0px';
    },
    setActiveDPI(index) {
      this.$emit('dpi-changed', index);
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
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  &.active {
    width: 14px;
    height: 14px;
    border: 2px solid white;
    outline: none;
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
  transition: all 0.2s ease;
  
  &.active {
    font-weight: 500;
  }
  
  &.underlined {
    text-decoration: underline;
  }
  
  &:hover {
    filter: brightness(1.2);
  }
}

// Add responsive scaling for marker positions
@media (max-width: 1600px) {
  .dpi-control-bar {
    width: clamp(700px, 75vw, 950px);
  }
  
  .dpi-marker {
    width: 12px;
    height: 12px;
    
    &.active {
      width: 12px;
      height: 12px;
    }
  }
  
  .dpi-value-label {
    font-size: 14px;
  }
  
  // Scale marker positions
  .dpi-marker, .dpi-value-label {
    &:nth-child(1) { left: calc(8px * 0.85); }
    &:nth-child(2) { left: calc(185px * 0.85); }
    &:nth-child(3) { left: calc(272px * 0.85); }
    &:nth-child(4) { left: calc(319px * 0.85); }
    &:nth-child(5) { left: calc(491px * 0.85); }
    &:nth-child(6) { left: calc(637px * 0.85); }
    &:nth-child(7) { left: calc(812px * 0.85); }
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
      width: 10px;
      height: 10px;
    }
  }
  
  .dpi-value-label {
    font-size: 13px;
  }
  
  // Scale marker positions
  .dpi-marker, .dpi-value-label {
    &:nth-child(1) { left: calc(8px * 0.75); }
    &:nth-child(2) { left: calc(185px * 0.75); }
    &:nth-child(3) { left: calc(272px * 0.75); }
    &:nth-child(4) { left: calc(319px * 0.75); }
    &:nth-child(5) { left: calc(491px * 0.75); }
    &:nth-child(6) { left: calc(637px * 0.75); }
    &:nth-child(7) { left: calc(812px * 0.75); }
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
      width: 8px;
      height: 8px;
    }
  }
  
  .dpi-value-label {
    font-size: 12px;
  }
  
  // Scale marker positions
  .dpi-marker, .dpi-value-label {
    &:nth-child(1) { left: calc(8px * 0.65); }
    &:nth-child(2) { left: calc(185px * 0.65); }
    &:nth-child(3) { left: calc(272px * 0.65); }
    &:nth-child(4) { left: calc(319px * 0.65); }
    &:nth-child(5) { left: calc(491px * 0.65); }
    &:nth-child(6) { left: calc(637px * 0.65); }
    &:nth-child(7) { left: calc(812px * 0.65); }
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
      width: 6px;
      height: 6px;
    }
  }
  
  .dpi-value-label {
    font-size: 11px;
  }
  
  // Scale marker positions
  .dpi-marker, .dpi-value-label {
    &:nth-child(1) { left: calc(8px * 0.55); }
    &:nth-child(2) { left: calc(185px * 0.55); }
    &:nth-child(3) { left: calc(272px * 0.55); }
    &:nth-child(4) { left: calc(319px * 0.55); }
    &:nth-child(5) { left: calc(491px * 0.55); }
    &:nth-child(6) { left: calc(637px * 0.55); }
    &:nth-child(7) { left: calc(812px * 0.55); }
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
      width: 4px;
      height: 4px;
    }
  }
  
  .dpi-value-label {
    font-size: 10px;
  }
  
  // Scale marker positions
  .dpi-marker, .dpi-value-label {
    &:nth-child(1) { left: calc(8px * 0.45); }
    &:nth-child(2) { left: calc(185px * 0.45); }
    &:nth-child(3) { left: calc(272px * 0.45); }
    &:nth-child(4) { left: calc(319px * 0.45); }
    &:nth-child(5) { left: calc(491px * 0.45); }
    &:nth-child(6) { left: calc(637px * 0.45); }
    &:nth-child(7) { left: calc(812px * 0.45); }
  }
}
</style> 