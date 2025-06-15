<template>
  <button 
    class="back-btn"
    @click="handleBack"
    title="Go Back"
  >
    <i class="el-icon-arrow-left"></i>
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
.back-btn {
  width: 56px;
  height: 56px;
  background: #27272a;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3f3f46;
    transform: translateX(-2px);
  }
  
  &:active {
    transform: translateX(0);
  }
  
  i {
    font-size: 20px;
    color: #e5e5e5;
  }
}
</style> 