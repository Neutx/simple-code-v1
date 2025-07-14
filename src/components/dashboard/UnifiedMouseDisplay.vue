<template>
  <div 
    class="unified-mouse-display"
    :class="[
      `mode-${mode}`,
      { 'panel-expanded': isPanelExpanded }
    ]"
  >
    <!-- Common mouse elements -->
    <div class="mouse-glow"></div>
    <img 
      :src="mouseImageSrc" 
      :alt="deviceModel + ' Mouse'"
      class="mouse-image"
      @error="handleImageError"
    />

    <!-- Mode-specific overlays or elements -->
    <div v-if="mode === 'keys'" class="key-labels">
      <!-- Key remapping labels can be added here -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnifiedMouseDisplay',
  props: {
    mode: {
      type: String,
      default: 'home' // e.g., 'home', 'dpi', 'keys', 'sensor'
    },
    deviceModel: {
      type: String,
      default: 'Ikarus'
    },
    mouseImageSrc: {
      type: String,
      default: '/mice/ikarus.svg'
    },
    isPanelExpanded: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleImageError(event) {
      // Fallback to a default image if the provided src fails
      event.target.src = '/mice/ikarus.svg'
    }
  }
}
</script>

<style lang="scss" scoped>
.unified-mouse-display {
  position: absolute;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  .mouse-glow {
    position: absolute;
    border-radius: 50%;
    z-index: 1;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mouse-image {
    position: relative;
    z-index: 2;
    object-fit: contain;
    filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.2));
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Home State */
.unified-mouse-display.mode-home {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  
  .mouse-glow {
    width: 400px;
    height: 400px;
    background: #8b5cf6;
    filter: blur(150px);
    opacity: 0.4;
  }
  .mouse-image {
    width: 300px;
  }
}

/* DPI State */
.unified-mouse-display.mode-dpi {
  top: 85%;
  left: 55%;
  // Change the scale value below to make the mouse larger or smaller
  transform: translate(-50%, -50%) scale(1.1); // <-- Increase this value (e.g., to 1.3)

  .mouse-glow {
    width: 450px;
    height: 450px;
    background: #a855f7;
    filter: blur(180px);
    opacity: 0.5;
  }
  .mouse-image {
    // Increase the width below to make the mouse image larger
    width: 450px; // <-- Increase this value (e.g., to 400px)
  }
}

/* Keys State */
.unified-mouse-display.mode-keys {
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%) scale(1);

  &.panel-expanded {
    left: 45%;
  }

  .mouse-glow {
    width: 400px;
    height: 400px;
    background: #9333ea;
    filter: blur(160px);
    opacity: 0.45;
  }
  .mouse-image {
    width: 320px;
  }
}

/* Sensor State */
.unified-mouse-display.mode-sensor {
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%) scale(1);

  .mouse-glow {
    width: 400px;
    height: 400px;
    background: #7e22ce;
    filter: blur(160px);
    opacity: 0.4;
  }
  .mouse-image {
    width: 320px;
  }
}
</style> 