<template>
  <div class="dpi-top-bar" :class="{ 'bar-visible': isVisible }">
    <div class="dpi-track">
      <div class="dpi-range-labels">
        <span class="range-start">100</span>
        <span class="range-end">8000</span>
      </div>
      
      <div class="dpi-slider">
        <div class="slider-track"></div>
        
        <!-- DPI Points -->
        <div v-for="(dpi, index) in dpiPoints" 
             :key="index"
             class="dpi-point"
             :class="{ active: dpi.active }"
             :style="{ 
               left: dpi.position + '%',
               backgroundColor: dpi.color
             }"
             @click="selectDPI(index)">
        </div>
      </div>
      
      <div class="dpi-values">
        <span v-for="(dpi, index) in dpiPoints" 
              :key="index"
              class="dpi-value"
              :class="{ 
                active: dpi.active,
                selected: dpi.selected 
              }"
              :style="{ 
                left: dpi.position + '%',
                color: dpi.color
              }">
          {{ dpi.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DPITopBar',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dpiPoints: [
        { value: 100, color: '#ef4444', position: 0, active: false, selected: false },
        { value: 1200, color: '#22c55e', position: 16, active: true, selected: true },
        { value: 1600, color: '#eab308', position: 24, active: false, selected: false },
        { value: 1800, color: '#06b6d4', position: 28, active: false, selected: false },
        { value: 2000, color: '#3730a3', position: 44, active: false, selected: false },
        { value: 5000, color: '#d946ef', position: 56, active: false, selected: false },
        { value: 5400, color: '#64748b', position: 72, active: false, selected: false }
      ]
    }
  },
  methods: {
    selectDPI(index) {
      // Reset all selections
      this.dpiPoints.forEach(point => {
        point.active = false
        point.selected = false
      })
      
      // Set the clicked one as active and selected
      this.dpiPoints[index].active = true
      this.dpiPoints[index].selected = true
      
      // Emit the selected DPI value
      this.$emit('dpi-selected', this.dpiPoints[index].value)
    }
  }
}
</script>

<style lang="scss" scoped>
.dpi-top-bar {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 70vw;
  max-width: 1200px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 15;

  &.bar-visible {
    opacity: 1;
    visibility: visible;
  }
}

.dpi-track {
  position: relative;
  padding: 20px 0;
}

.dpi-range-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  
  span {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
  }
}

.dpi-slider {
  position: relative;
  margin: 20px 0;
}

.slider-track {
  width: 100%;
  height: 10px;
  background: #404040;
  border-radius: 20px;
}

.dpi-point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
  
  &.active {
    border: 2px solid white;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.dpi-values {
  position: relative;
  height: 24px;
  margin-top: 20px;
  
  .dpi-value {
    position: absolute;
    transform: translateX(-50%);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.selected {
      text-decoration: underline;
      font-weight: 600;
    }
    
    &:hover {
      opacity: 0.8;
    }
  }
}

// Responsive breakpoints
@media (max-width: 1024px) {
  .dpi-top-bar {
    width: 85vw;
  }
  
  .dpi-range-labels span,
  .dpi-value {
    font-size: 14px;
  }
  
  .dpi-point {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 768px) {
  .dpi-top-bar {
    width: 95vw;
  }
  
  .dpi-range-labels span,
  .dpi-value {
    font-size: 12px;
  }
  
  .dpi-point {
    width: 10px;
    height: 10px;
  }
}
</style> 