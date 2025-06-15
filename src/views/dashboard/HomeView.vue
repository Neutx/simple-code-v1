<template>
  <div class="home-view">
    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-item">
        <i class="el-icon-connection"></i>
        <span class="status-label">Model:</span>
        <span class="status-value">{{ deviceModel }}</span>
      </div>
      <div class="status-item">
        <i class="el-icon-cpu"></i>
        <span class="status-label">DPI:</span>
        <span class="status-value">{{ currentDPI }}</span>
      </div>
      <div class="status-item">
        <i class="el-icon-time"></i>
        <span class="status-label">Polling rate:</span>
        <span class="status-value">{{ pollingRate }}Hz</span>
      </div>
      <div class="status-item">
        <i class="el-icon-lightning"></i>
        <span class="status-label">Battery:</span>
        <span class="status-value">{{ batteryLevel }}%</span>
        <i v-if="isCharging" class="el-icon-lightning charging-icon"></i>
      </div>
      <div class="status-item">
        <i class="el-icon-view"></i>
        <span class="status-label">Motion sync:</span>
        <span class="status-value">{{ motionSync ? 'ON' : 'OFF' }}</span>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Mouse Visualization -->
      <div class="mouse-visualization">
        <div class="mouse-container">
          <!-- Mouse SVG will be placed here -->
          <div class="mouse-placeholder">
            <img src="/mice/default-mouse.svg" alt="Mouse" class="mouse-image" />
            <div class="mouse-glow" :style="{ background: rgbColor }"></div>
          </div>
          
          <!-- Profile Button -->
          <div class="profile-section">
            <el-button class="profile-button" @click="showProfileMenu = !showProfileMenu">
              Profile 1
              <i class="el-icon-arrow-down"></i>
            </el-button>
            
            <!-- Profile Menu -->
            <div v-if="showProfileMenu" class="profile-menu glass-effect">
              <div class="profile-item active">
                <span>Profile 1</span>
                <i class="el-icon-check"></i>
              </div>
              <div class="profile-item">
                <span>Profile 2</span>
              </div>
              <div class="profile-item">
                <span>Profile 3</span>
              </div>
              <div class="profile-divider"></div>
              <div class="profile-item">
                <i class="el-icon-plus"></i>
                <span>Add Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HomeView',
  data() {
    return {
      showProfileMenu: false
    }
  },
  computed: {
    ...mapGetters('device', ['deviceInfo', 'battery', 'isConnected']),
    ...mapGetters('settings', ['dpiSettings', 'pollingRate', 'rgbSettings', 'sensorSettings']),
    
    deviceModel() {
      if (!this.deviceInfo) return 'Unknown'
      return `Device ${this.deviceInfo.cid}_${this.deviceInfo.mid}`
    },
    
    currentDPI() {
      if (!this.dpiSettings.stages.length) return '800'
      return this.dpiSettings.stages[this.dpiSettings.current] || '800'
    },
    
    batteryLevel() {
      return this.battery.level || 50
    },
    
    isCharging() {
      return this.battery.charging || false
    },
    
    motionSync() {
      return this.sensorSettings.motionSync || false
    },
    
    rgbColor() {
      const color = this.rgbSettings.color || '#8B5CF6'
      const opacity = this.rgbSettings.enabled ? 0.6 : 0.1
      return `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16)} 0%, transparent 70%)`
    }
  },
  
  mounted() {
    // Close profile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showProfileMenu = false
      }
    })
    
    // Redirect if not connected
    if (!this.isConnected) {
      this.$router.push('/initialize')
    }
  },
  
  beforeDestroy() {
    document.removeEventListener('click', this.handleOutsideClick)
  }
}
</script>

<style lang="scss" scoped>
.home-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-secondary);
  flex-wrap: wrap;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  i {
    color: var(--accent-primary);
    font-size: 1rem;
  }
}

.status-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.status-value {
  color: var(--text-primary);
  font-weight: 600;
}

.charging-icon {
  color: var(--warning);
  animation: pulse 1.5s infinite;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-visualization {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.mouse-placeholder {
  position: relative;
  width: 300px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  position: relative;
}

.mouse-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  border-radius: 50%;
  z-index: 1;
  transition: all 0.3s ease;
}

.profile-section {
  position: relative;
}

.profile-button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-primary);
  }
  
  i {
    transition: transform 0.2s ease;
  }
  
  &.active i {
    transform: rotate(180deg);
  }
}

.profile-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  padding: 0.5rem;
  min-width: 150px;
  border-radius: 12px;
  z-index: 1000;
}

.profile-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-glass);
    color: var(--text-primary);
  }
  
  &.active {
    background: var(--accent-primary);
    color: white;
  }
  
  i {
    font-size: 1rem;
  }
}

.profile-divider {
  height: 1px;
  background: var(--border-secondary);
  margin: 0.5rem 0;
}

// Animations
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Responsive design
@media (max-width: 768px) {
  .status-bar {
    padding: 1rem;
    justify-content: center;
  }
  
  .status-item {
    font-size: 0.8rem;
  }
  
  .mouse-placeholder {
    width: 250px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .status-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .status-item {
    justify-content: center;
  }
  
  .mouse-placeholder {
    width: 200px;
    height: 120px;
  }
}
</style> 