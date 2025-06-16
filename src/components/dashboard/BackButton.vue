<template>
  <button 
    class="back-button"
    @click="handleBack"
    title="Go Back"
  >
    <IconifyIcon icon="ion:chevron-back" />
  </button>
</template>

<script>
export default {
  name: 'BackButton',
  methods: {
    handleBack() {
      this.$emit('back')
      // Default behavior: go back in history
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.back-button {
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
  border-radius: clamp(14px, 1vw, 17px);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(16px);
  
  &:hover {
    background: rgba(80, 80, 80, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }
  
  &:active {
    transform: translateX(0);
  }
  
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
  .back-button {
    width: 2.8vw;
    height: 2.8vw;
    min-width: 38px;
    min-height: 38px;
  }
}

@media (max-width: 1440px) {
  .back-button {
    width: 2.5vw;
    height: 2.5vw;
    min-width: 36px;
    min-height: 36px;
  }
}

@media (max-width: 1200px) {
  .back-button {
    width: 2.2vw;
    height: 2.2vw;
    min-width: 34px;
    min-height: 34px;
  }
}

@media (max-width: 1024px) {
  .back-button {
    width: 4vw;
    height: 4vw;
    min-width: 42px;
    min-height: 42px;
    max-width: 55px;
    max-height: 55px;
  }
}

@media (max-width: 768px) {
  .back-button {
    width: 6vw;
    height: 6vw;
    min-width: 44px;
    min-height: 44px;
    max-width: 50px;
    max-height: 50px;
  }
}

@media (max-width: 480px) {
  .back-button {
    width: 10vw;
    height: 10vw;
    min-width: 46px;
    min-height: 46px;
    max-width: 52px;
    max-height: 52px;
  }
}
</style> 