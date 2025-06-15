<template>
  <div class="loading-spinner" v-if="show">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-spinner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-secondary);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  color: white;
  margin-top: 1rem;
  font-size: 0.875rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 