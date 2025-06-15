<template>
  <div class="action-buttons">
    <button 
      class="action-btn"
      @click="handleCalibrate"
      title="Calibrate"
    >
      <i class="el-icon-aim"></i>
    </button>
    
    <button 
      class="action-btn"
      @click="handleSettings"
      title="Settings"
    >
      <i class="el-icon-setting"></i>
    </button>
    
    <button 
      class="action-btn"
      @click="handleProfile"
      title="Profile"
    >
      <i class="el-icon-user"></i>
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
  justify-content: flex-end;
  align-items: flex-start;
  gap: 10px;
}

.action-btn {
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
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  i {
    font-size: 20px;
    color: white;
  }
}
</style> 