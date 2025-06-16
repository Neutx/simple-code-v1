<template>
  <div class="mouse-visualization" :class="{ 'dpi-mode': isDPIMode }">
    <div class="mouse-glow"></div>
    <div class="mouse-container">
      <img 
        :src="mouseImage" 
        :alt="deviceModel + ' Mouse'"
        class="mouse-image"
        @error="handleImageError"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MouseVisualization',
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
.mouse-visualization {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Use clamp for fluid and constrained sizing */
  width: clamp(280px, 22vw, 450px);
  height: auto;
  transition: all 0.5s ease;

  &.dpi-mode {
    /* Expand to double length and reposition */
    width: clamp(560px, 44vw, 900px);
    
    .mouse-image {
      width: 40%; /* Adjust width to maintain aspect ratio */
      transform: scaleY(2); /* Double the height */
    }
    
    .mouse-glow {
      width: 50%; /* Adjust glow size for expanded mouse */
      height: 85%; /* Taller glow for elongated mouse */
    }
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
  transition: all 0.5s ease;
}

.mouse-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.mouse-image {
  width: 60%;
  max-width: 266px; /* Original design width */
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  transition: all 0.5s ease;
  
  &:hover {
    transform: scale(1.02);
  }
}
</style> 