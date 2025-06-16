<template>
  <div class="status-container">
    <div class="status-item">
      <div class="status-icon">
        <IconifyIcon icon="solar:mouse-outline" />
      </div>
      <div class="status-text">
        <span class="status-label">Model: </span>
        <span class="status-value">{{ deviceModel }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <img src="/icons/dpi.svg" alt="DPI" />
      </div>
      <div class="status-text">
        <span class="status-label">DPI: </span>
        <span class="status-value">{{ currentDPI }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <IconifyIcon icon="material-symbols:speed-outline-rounded" />
      </div>
      <div class="status-text">
        <span class="status-label">Polling rate: </span>
        <span class="status-value">{{ pollingRate }}Hz</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <IconifyIcon icon="mdi:battery-outline" />
      </div>
      <div class="status-text">
        <span class="status-label">Battery: </span>
        <span class="status-value">{{ batteryLevel }}%</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <IconifyIcon icon="mynaui:arrow-up-down" />
      </div>
      <div class="status-text">
        <span class="status-label">LOD: </span>
        <span class="status-value">{{ liftOffDistance }}</span>
      </div>
    </div>

    <div class="status-item">
      <div class="status-icon">
        <IconifyIcon icon="mdi:motion-outline" />
      </div>
      <div class="status-text">
        <span class="status-label">Motion sync: </span>
        <span class="status-value">{{ motionSync ? 'ON' : 'OFF' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  props: {
    deviceModel: {
      type: String,
      default: 'Ikarus'
    },
    currentDPI: {
      type: [String, Number],
      default: '420'
    },
    pollingRate: {
      type: [String, Number],
      default: '4000'
    },
    batteryLevel: {
      type: [String, Number],
      default: '69'
    },
    liftOffDistance: {
      type: String,
      default: '1MM'
    },
    motionSync: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.status-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 90vw;
  margin: 0 auto;
  gap: 1vw;
  flex-wrap: wrap;
  // Explicitly set no background
  background: none;
  background-color: transparent;
  border: none;
  box-shadow: none;
  outline: none;
}

.status-item {
  display: flex;
  align-items: flex-end;
  gap: 0.6vw;
  min-width: 0;
  flex: 1;
  justify-content: center;
  // Explicitly set no background
  background: none;
  background-color: transparent;
  border: none;
  box-shadow: none;
  outline: none;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5vw;
  height: 1.5vw;
  min-width: 20px;
  min-height: 20px;
  max-width: 28px;
  max-height: 28px;
  position: relative;
  flex-shrink: 0;
  // Explicitly set no background
  background: none;
  background-color: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  
  // Style for Iconify icons
  svg {
    font-size: clamp(16px, 1.2vw, 22px);
    color: white;
    width: 100%;
    height: 100%;
  }
  
  // Style for SVG images
  img {
    width: 100%;
    height: 100%;
    filter: brightness(0) invert(1); // Make SVG white
  }
}

.status-text {
  display: flex;
  align-items: center;
  gap: 0.2vw;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: clamp(12px, 1.1vw, 18px);
  line-height: 1.3;
  min-width: 0;
  // Explicitly set no background
  background: none;
  background-color: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  
  .status-label {
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    // Explicitly set no background
    background: none;
    background-color: transparent;
    border: none;
    box-shadow: none;
    outline: none;
  }
  
  .status-value {
    color: white;
    white-space: nowrap;
    // Explicitly set no background
    background: none;
    background-color: transparent;
    border: none;
    box-shadow: none;
    outline: none;
  }
}

// Responsive breakpoints
@media (max-width: 1600px) {
  .status-container {
    max-width: 85vw;
    gap: 0.8vw;
  }
  
  .status-item {
    gap: 0.5vw;
  }
}

@media (max-width: 1440px) {
  .status-container {
    max-width: 80vw;
    gap: 0.6vw;
  }
  
  .status-item {
    gap: 0.4vw;
  }
}

@media (max-width: 1200px) {
  .status-container {
    max-width: 75vw;
    gap: 0.5vw;
  }
  
  .status-item {
    gap: 0.3vw;
  }
}

@media (max-width: 1024px) {
  .status-container {
    max-width: 95vw;
    gap: 1vw;
    justify-content: space-around;
  }
  
  .status-item {
    gap: 0.8vw;
    flex: 0 1 auto;
    min-width: 15vw;
  }
  
  .status-icon {
    width: 2vw;
    height: 2vw;
    min-width: 22px;
    min-height: 22px;
  }
}

@media (max-width: 768px) {
  .status-container {
    max-width: 100vw;
    gap: 0.5vw;
    justify-content: space-between;
    padding: 0 1vw;
  }
  
  .status-item {
    gap: 1vw;
    flex: 1;
    min-width: 14vw;
    justify-content: flex-start;
  }
  
  .status-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    
    .status-label,
    .status-value {
      font-size: clamp(10px, 2vw, 14px);
      line-height: 1.2;
    }
  }
}

@media (max-width: 480px) {
  .status-container {
    flex-direction: column;
    gap: 1vh;
    max-width: 100vw;
    padding: 0 2vw;
  }
  
  .status-item {
    gap: 2vw;
    flex: none;
    width: 100%;
    justify-content: flex-start;
    padding: 0.5vh 0;
  }
  
  .status-icon {
    width: 6vw;
    height: 6vw;
    min-width: 24px;
    min-height: 24px;
    max-width: 32px;
    max-height: 32px;
  }
  
  .status-text {
    flex-direction: row;
    gap: 1vw;
    
    .status-label,
    .status-value {
      font-size: clamp(12px, 3vw, 16px);
    }
  }
}
</style> 