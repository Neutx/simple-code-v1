<template>
  <div class="mouse-visualization">
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
  width: 837px;
  height: 701px;
}

.mouse-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  background: #8b5cf6;
  border-radius: 50%;
  filter: blur(119.2px);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.mouse-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mouse-image {
  width: 266px;
  height: 439px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
}
</style> 