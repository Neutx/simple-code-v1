<template>
  <div class="action-buttons">
    <!-- Offers Button -->
    <button class="action-btn offers-btn">
      <IconifyIcon icon="hugeicons:gift" />
    </button>
    
    <!-- Settings Button -->
    <button class="action-btn settings-btn">
      <IconifyIcon icon="solar:settings-linear" />
    </button>
    
    <!-- Profile Button -->
    <button class="action-btn profile-btn">
      <IconifyIcon icon="iconamoon:profile" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  methods: {
    handleCalibrate() {
      this.$emit('calibrate')
      // Add calibration logic here
    },
    
    handleSettings() {
      this.$emit('settings')
      // Add settings logic here
    },
    
    handleProfile() {
      this.$emit('profile')
      // Add profile logic here
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3vw;
  height: 3vw;
  min-width: 40px;
  min-height: 40px;
  max-width: 60px;
  max-height: 60px;
  background: rgba(64, 64, 64, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: clamp(12px, 1vw, 18px);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(16px);
  
  &:hover {
    background: rgba(80, 80, 80, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  // Style for Iconify icons
  svg {
    font-size: clamp(16px, 1.2vw, 24px);
    color: white;
    width: clamp(16px, 1.2vw, 24px);
    height: clamp(16px, 1.2vw, 24px);
  }
  
  // Legacy Element UI icon styles (for backward compatibility)
  i {
    font-size: clamp(16px, 1.2vw, 24px);
    color: white;
  }
}

// Responsive breakpoints
@media (max-width: 1600px) {
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    width: 2.8vw;
    height: 2.8vw;
    min-width: 38px;
    min-height: 38px;
  }
}

@media (max-width: 1440px) {
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    width: 2.5vw;
    height: 2.5vw;
    min-width: 36px;
    min-height: 36px;
  }
}

@media (max-width: 1200px) {
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    width: 2.2vw;
    height: 2.2vw;
    min-width: 34px;
    min-height: 34px;
  }
}

@media (max-width: 1024px) {
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    width: 4vw;
    height: 4vw;
    min-width: 42px;
    min-height: 42px;
    max-width: 55px;
    max-height: 55px;
  }
}

@media (max-width: 768px) {
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    width: 6vw;
    height: 6vw;
    min-width: 44px;
    min-height: 44px;
    max-width: 50px;
    max-height: 50px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    gap: 10px;
  }
  
  .action-btn {
    width: 10vw;
    height: 10vw;
    min-width: 46px;
    min-height: 46px;
    max-width: 52px;
    max-height: 52px;
  }
}
</style> 