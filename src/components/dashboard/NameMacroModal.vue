<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <h2 class="modal-title">Name this macro</h2>
      <div class="input-wrapper">
        <input type="text" v-model="macroName" placeholder="Name" class="name-input" />
      </div>
      <div class="button-group">
        <button class="dismiss-btn" @click="$emit('dismiss')">Dismiss</button>
        <button class="confirm-btn" @click="handleConfirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NameMacroModal',
  data() {
    return {
      macroName: ''
    }
  },
  methods: {
    handleConfirm() {
      if (this.macroName.trim()) {
        this.$emit('confirm', this.macroName.trim());
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 420px;
  padding: 30px;
  background: rgba(39, 39, 42, 0.8);
  border-radius: 24px;
  backdrop-filter: blur(54px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-title {
  color: white;
  font-size: 24px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  margin: 0 0 40px 0;
}

.input-wrapper {
  margin-bottom: 50px;
}

.name-input {
  width: 100%;
  height: 60px;
  background-color: rgba(64, 64, 64, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
  color: white;
  font-size: 18px;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.dismiss-btn,
.confirm-btn {
  flex: 1;
  height: 56px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dismiss-btn {
  background-color: rgba(64, 64, 64, 0.8);
  color: white;
  
  &:hover {
    background-color: rgba(80, 80, 80, 0.8);
  }
}

.confirm-btn {
  background-color: #8B5CF6;
  color: white;

  &:hover {
    background-color: #7C3AED;
  }
}
</style> 