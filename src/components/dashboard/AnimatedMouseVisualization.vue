<template>
  <div class="animated-mouse-visualization" :class="{ 'dpi-mode': isDPIMode }">
    <div class="mouse-glow" :class="{ 'dpi-mode': isDPIMode }"></div>
    <div class="mouse-container" :class="{ 'dpi-mode': isDPIMode }">
      <img 
        :src="mouseImage" 
        :alt="deviceModel + ' Mouse'"
        class="mouse-image"
        :class="{ 'dpi-mode': isDPIMode }"
        @error="handleImageError"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedMouseVisualization',
  props: {
    deviceModel: {
      type: String,
      default: 'Ikarus'
    },
    mouseImage: {
      type: String,
      default: '/mice/ikarus.svg'
    },
    isDPIMode: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleImageError(event) {
      event.target.src = '/mice/ikarus.svg'
    }
  }
}
</script>

<style lang="scss" scoped>
.animated-mouse-visualization {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(280px, 22vw, 450px);
  height: auto;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 5;
  
  &.dpi-mode {
    // Double the width and shift right
    width: clamp(560px, 44vw, 900px);
    transform: translateX(20vw);
    z-index: 3; // Lower z-index to go behind DPI controls
  }
}

.mouse-glow {
  position: absolute;
  width: 75%;
  height: 75%;
  background: #8b5cf6;
  border-radius: 50%;
  filter: blur(110px);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &.dpi-mode {
    // Make the glow more intense and larger in DPI mode but contain it better
    filter: blur(120px);
    width: 50%;
    height: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%);
    // Shift the glow slightly left to better center it on the visible mouse
    transform: translate(-100%, -50%);
  }
}

.mouse-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &.dpi-mode {
    // Adjust positioning to show only part of the mouse
    transform: translateX(-25%);
  }
}

.mouse-image {
  width: 60%;
  max-width: 266px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover:not(.dpi-mode) {
    transform: scale(1.02);
  }
  
  &.dpi-mode {
    // Double the size when in DPI mode
    width: 120%;
    max-width: 532px;
    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
    
    // Remove hover effect in DPI mode
    &:hover {
      transform: none;
    }
  }
}

// Responsive adjustments for DPI mode
@media (max-width: 1600px) {
  .animated-mouse-visualization.dpi-mode {
    transform: translateX(18vw);
  }
}

@media (max-width: 1440px) {
  .animated-mouse-visualization.dpi-mode {
    transform: translateX(16vw);
    width: clamp(500px, 40vw, 800px);
  }
  
  .mouse-container.dpi-mode {
    transform: translateX(-20%);
  }
}

@media (max-width: 1200px) {
  .animated-mouse-visualization.dpi-mode {
    transform: translateX(14vw);
    width: clamp(450px, 38vw, 700px);
  }
  
  .mouse-container.dpi-mode {
    transform: translateX(-15%);
  }
}

@media (max-width: 1024px) {
  .animated-mouse-visualization.dpi-mode {
    transform: translateX(12vw);
    width: clamp(400px, 35vw, 600px);
  }
  
  .mouse-container.dpi-mode {
    transform: translateX(-10%);
  }
  
  .mouse-image.dpi-mode {
    width: 100%;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .animated-mouse-visualization.dpi-mode {
    transform: translateX(10vw);
    width: clamp(350px, 32vw, 500px);
  }
  
  .mouse-container.dpi-mode {
    transform: translateX(-5%);
  }
  
  .mouse-image.dpi-mode {
    width: 90%;
    max-width: 400px;
  }
}
</style> 