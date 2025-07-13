<template>
  <div class="action-buttons">
    <!-- Offers Button -->
    <button class="action-btn offers-btn" @click="handleOffers">
      <IconifyIcon icon="hugeicons:gift" />
    </button>
    
    <!-- Settings Button with Dropdown -->
    <div class="settings-wrapper" ref="settingsWrapper">
      <button class="action-btn settings-btn" @click="toggleSettingsDropdown">
        <IconifyIcon icon="solar:settings-linear" />
      </button>
      
      <!-- Settings Dropdown Menu -->
      <transition name="dropdown-fade">
        <div v-if="showSettingsDropdown" class="settings-dropdown">
          <div class="settings-content">
            <!-- Settings Title -->
            <div class="settings-title">
              <h3>Settings</h3>
            </div>
            
            <!-- Toggle Options -->
            <div class="toggle-section">
              <div class="toggle-item">
                <span class="toggle-label">Long distance mode</span>
                <div class="toggle-switch" :class="{ active: longDistanceMode }" @click="toggleLongDistanceMode">
                  <div class="toggle-icon">
                    <IconifyIcon icon="material-symbols:check" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Device Information -->
            <div class="device-info-section">
              <div class="section-title">Device information</div>
              
              <div class="info-item">
                <span class="info-label">Receiver version</span>
                <span class="info-value">v2.00</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">USB version</span>
                <span class="info-value">v3.10</span>
              </div>
            </div>
            
            <!-- Check for Updates Button -->
            <div class="update-section">
              <button class="update-button" @click="checkForUpdates">
                Check for updates
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Profile Button with Dropdown -->
    <div class="profile-wrapper" ref="profileWrapper">
      <button class="action-btn profile-btn" @click="toggleProfileDropdown">
        <IconifyIcon icon="iconamoon:profile" />
      </button>
      
      <!-- Profile Dropdown Menu -->
      <transition name="dropdown-fade">
        <div v-if="showProfileDropdown" class="profile-dropdown">
          <div class="dropdown-item logout-item" @click="handleLogout">
            <div class="dropdown-icon">
              <IconifyIcon icon="solar:logout-2-linear" />
            </div>
            <span class="dropdown-text">Logout</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  data() {
    return {
      showProfileDropdown: false,
      showSettingsDropdown: false,
      longDistanceMode: false,
      receiverVersion: 'v2.00',
      usbVersion: 'v3.10'
    }
  },
  mounted() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', this.handleClickOutside)
    
    // Initialize from device state if available
    this.initializeFromDeviceState()
    
    // Listen for device updates to sync long distance mode
    this.$bus.$on("updateMouseUI", (value) => {
      if (value && value.longDistance !== undefined) {
        this.longDistanceMode = value.longDistance
        console.log('🔄 ActionButtons: Long distance mode updated from device:', value.longDistance)
      }
    })
    
    // Listen for device connection events
    this.$bus.$on("deviceConnect", (connected) => {
      if (connected) {
        // Initialize from device state when device connects
        setTimeout(() => {
          this.initializeFromDeviceState()
        }, 500)
      }
    })
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$bus.$off("updateMouseUI")
    this.$bus.$off("deviceConnect")
  },
  methods: {
    handleCalibrate() {
      this.$emit('calibrate')
      // Add calibration logic here
    },
    
    handleSettings() {
      this.$emit('settings')
      // Add settings logic here
    },
    
    toggleProfileDropdown() {
      this.showProfileDropdown = !this.showProfileDropdown
    },
    
    toggleSettingsDropdown() {
      this.showSettingsDropdown = !this.showSettingsDropdown
    },
    
    async toggleLongDistanceMode() {
      try {
        // Import HIDHandle for device communication
        const HIDHandle = (await import('@/assets/js/HIDHandle')).default
        
        // Toggle the local state
        this.longDistanceMode = !this.longDistanceMode
        
        // Sync with device using the same method as OtherSetting.vue
        await HIDHandle.Set_Device_LongDistance(this.longDistanceMode ? 1 : 0)
        
        console.log('Long distance mode toggled:', this.longDistanceMode)
      } catch (error) {
        console.error('Error toggling long distance mode:', error)
        // Revert local state if device update fails
        this.longDistanceMode = !this.longDistanceMode
      }
    },
    
    checkForUpdates() {
      // Add logic to check for updates
      console.log('Checking for updates...')
      // You can replace this with actual update checking logic
      this.$message.success('You\'re on the latest version!')
    },
    
    handleOffers() {
      this.$message.info('Coming soon!')
    },
    
    handleClickOutside(event) {
      if (this.$refs.profileWrapper && !this.$refs.profileWrapper.contains(event.target)) {
        this.showProfileDropdown = false
      }
      if (this.$refs.settingsWrapper && !this.$refs.settingsWrapper.contains(event.target)) {
        this.showSettingsDropdown = false
      }
    },
    
    handleLogout() {
      this.showProfileDropdown = false
      
      try {
        // Check if auth store exists and dispatch logout
        if (this.$store && this.$store.dispatch) {
          this.$store.dispatch('auth/logout').then(() => {
            this.$router.push('/login')
          }).catch((error) => {
            console.error('Logout error:', error)
            // Force redirect even if logout fails
            this.$router.push('/login')
          })
        } else {
          // Fallback: direct redirect if store is not available
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('Logout error:', error)
        // Force redirect on any error
        this.$router.push('/login')
      }
    },

    async initializeFromDeviceState() {
      try {
        // Import HIDHandle for device communication
        const HIDHandle = (await import('@/assets/js/HIDHandle')).default
        
        // Check if device is connected and has state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.deviceOpen) {
          const mouseCfg = HIDHandle.deviceInfo.mouseCfg
          if (mouseCfg && mouseCfg.longDistance !== undefined) {
            this.longDistanceMode = mouseCfg.longDistance
            console.log('🔄 ActionButtons: Long distance mode initialized from device:', this.longDistanceMode)
          }
        }
      } catch (error) {
        console.error('🔄 ActionButtons: Error initializing from device state:', error)
      }
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

.settings-wrapper {
  position: relative;
}

.profile-wrapper {
  position: relative;
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

.settings-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 288px;
  height: 480px;
  background: rgba(64, 64, 64, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0);
  padding: 35px 24px;
  z-index: 9999;
  overflow: hidden;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100%;
}

.settings-title {
  h3 {
    font-family: 'DM Sans', sans-serif;
    font-size: 30px;
    font-weight: 600;
    color: white;
    margin: 0;
    text-align: left;
  }
}

.toggle-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  
  .toggle-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: #d4d4d8;
  }
  
  .toggle-switch {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      background: #a855f7;
      
      .toggle-icon svg {
        color: white;
        width: 12px;
        height: 10px;
      }
    }
    
    &:not(.active) {
      background: #27272a;
      
      .toggle-icon svg {
        color: #e5e5e5;
        width: 12px;
        height: 10px;
      }
    }
    
    .toggle-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.device-info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  .section-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: #d4d4d8;
    margin: 0;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 28px;
    
    .info-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 20px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.3);
    }
    
    .info-value {
      font-family: 'DM Sans', sans-serif;
      font-size: 20px;
      font-weight: 500;
      color: white;
    }
  }
}

.update-section {
  margin-top: auto;
  
  .update-button {
    width: 100%;
    height: 56px;
    background: #27272a;
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #3f3f46;
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 288px;
  height: auto;
  min-height: 86px;
  background: rgba(64, 64, 64, 0.4);
  border-radius: 24px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  z-index: 9999;
  overflow: hidden;
}

.dropdown-item {
  width: 256px;
  height: 56px;
  padding: 0 20px;
  background: #27272a;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3f3f46;
    transform: translateX(2px);
  }
  
  &.logout-item {
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
    
    .dropdown-icon svg {
      color: #ef4444;
    }
    
    .dropdown-text {
      color: #ef4444;
    }
  }
}

.dropdown-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
}

.dropdown-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: white;
  flex: 1;
  text-align: left;
}

// Dropdown animation
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dropdown-fade-enter {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
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