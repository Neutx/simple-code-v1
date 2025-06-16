<template>
  <transition name="slide-in" appear>
    <div class="dpi-settings-panel">
      <!-- Header Section -->
      <div class="panel-header">
        <h2 class="panel-title">DPI</h2>
        <p class="panel-description">
          Change your mice's sensitivity here. You can also add one by clicking on the slider.
        </p>
      </div>

      <!-- DPI Light Section -->
      <div class="setting-row">
        <label class="setting-label">DPI Light</label>
        <div class="dropdown-container">
          <select v-model="dpiLightMode" class="dpi-dropdown">
            <option value="steady">Steady</option>
            <option value="off">Off</option>
            <option value="breathing">Breathing</option>
          </select>
          <div class="dropdown-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- DPI Light Brightness -->
      <div class="setting-section">
        <label>DPI light brightness</label>
        <br>
        <div class="slider-container">
          <div class="slider-labels">
            <span v-for="n in 10" :key="n" class="slider-label" :class="{ active: n <= dpiLightBrightness }">
              {{ n }}
            </span>
          </div>
          <input 
            type="range" 
            v-model="dpiLightBrightness" 
            min="1" 
            max="10" 
            class="custom-slider brightness-slider"
            :style="{ background: `linear-gradient(to right, #A278FD 0%, #A278FD ${(dpiLightBrightness/10)*100}%, #27272A ${(dpiLightBrightness/10)*100}%, #27272A 100%)` }"
          />
        </div>
      </div>

      <!-- DPI Light Speed -->
      <div class="setting-section">
        <br>
        <label>DPI light speed</label>
        <br>
        <div class="slider-container">
          <div class="slider-labels">
            <span v-for="n in 10" :key="n" class="slider-label" :class="{ active: n <= dpiLightSpeed }">
              {{ n }}
            </span>
          </div>
          <input 
            type="range" 
            v-model="dpiLightSpeed" 
            min="1" 
            max="10" 
            class="custom-slider speed-slider"
            :style="{ background: `linear-gradient(to right, #A278FD 0%, #A278FD ${(dpiLightSpeed/10)*100}%, #27272A ${(dpiLightSpeed/10)*100}%, #27272A 100%)` }"
          />
        </div>
      </div>

      <!-- Max DPI Profiles -->
      <div class="setting-section profile-section">
        <br>
        <label>Max DPI profiles</label>
        <br>
        <!-- Profile Selector -->
        <div class="profile-selector">
          <div class="profile-item active">1</div>
        </div>

        <!-- DPI Profile List -->
        <div class="dpi-profiles">
          <div v-for="(profile, index) in dpiProfiles" :key="index" class="dpi-profile-item">
            <span class="profile-dpi">{{ profile.dpi }}</span>
            <div class="profile-color" :style="{ backgroundColor: profile.color }"></div>
            <button class="profile-menu-btn">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="action-btn add-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"/>
            </svg>
            Add a DPI
          </button>
          <button class="action-btn reset-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12C3 7.03 7.03 3 12 3C17 3 21 7.03 21 12C21 17 17 21 12 21C7.03 21 3 17 3 12Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2"/>
            </svg>
            Reset to default
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'DPISettingsPanel',
  data() {
    return {
      dpiLightMode: 'steady',
      dpiLightBrightness: 5,
      dpiLightSpeed: 1,
      selectedProfile: 1,
      dpiProfiles: [
        { dpi: 800, color: '#EF4444' },   // red
        { dpi: 1200, color: '#10B981' },  // green
        { dpi: 1600, color: '#FDE047' },  // yellow
        { dpi: 1800, color: '#06B6D4' },  // cyan
        { dpi: 2000, color: '#4F46E5' },  // indigo
        { dpi: 5000, color: '#EC4899' },  // pink
        { dpi: 5400, color: '#64748B' }   // slate
      ]
    }
  },
  watch: {
    dpiLightBrightness(val) {
      // Ensure the value is a number
      this.dpiLightBrightness = parseInt(val)
    },
    dpiLightSpeed(val) {
      // Ensure the value is a number
      this.dpiLightSpeed = parseInt(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-in-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-in-enter {
  transform: translateX(-100%);
  opacity: 0;
}

.dpi-settings-panel {
  position: fixed;
  left: 3vw;
  top: calc(10vh + 80px);
  bottom: 100px;
  width: 384px;
  background: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 31px 16px 16px 16px;
  z-index: 20;
  overflow-y: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.panel-header {
  margin-bottom: 24px;
  padding: 0 7px;
}

.panel-title {
  color: white;
  font-size: 30px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  margin: 0 0 12px 0;
}

.panel-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  margin: 0;
  line-height: 1.4;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 7px;
  margin-bottom: 24px;
}

.setting-label {
  color: #D4D4D8;
  font-size: 20px;
  font-family: 'DM Sans', sans-serif;
}

.dropdown-container {
  position: relative;
  width: 144px;
  padding: 8px;
  background: transparent;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &:focus-within {
    background: rgba(39, 39, 39);
  }
}

.dpi-dropdown {
  width: 100%;
  height: 24px;
  background: transparent;
  border: none;
  color: #A278FD;
  font-size: 20px;
  font-family: 'DM Sans', sans-serif;
  text-align: right;
  padding-right: 28px;
  appearance: none;
  cursor: pointer;
  
  &:focus {
    outline: none;
  }
}

.dropdown-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #D4D4D8;
  pointer-events: none;
}

.setting-section {
  margin-bottom: 24px;
  padding: 0 8px;

  label {
    display: block;
    color: white;
    font-size: 16px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 16px;  // Increased spacing instead of <br>
  }
}

.slider-container {
  position: relative;
  width: 100%;
  height: 48px;
}

.custom-slider {
  width: 100%;
  height: 6px;
  background: #27272A;
  border-radius: 8px;
  appearance: none;
  position: absolute;
  bottom: 0;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 6px;
    background: #A278FD;
    border-radius: 8px;
    cursor: pointer;
  }

  &.brightness-slider {
    background: linear-gradient(to right, #A278FD 0%, #A278FD 50%, #27272A 50%, #27272A 100%);
  }

  &.speed-slider {
    background: linear-gradient(to right, #A278FD 0%, #A278FD 10%, #27272A 10%, #27272A 100%);
  }
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  position: absolute;
  width: 100%;
  top: 0;
  padding-bottom: 12px;
  
  .slider-label {
    color: white;
    font-size: 16px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    opacity: 0.3;
    text-align: center;
    width: 28px;
    
    &.active {
      opacity: 1;
    }
  }
}

.profile-section {
  margin-top: 24px;
}

.profile-selector {
  background: #3F3F46;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  
  .profile-item {
    width: 100%;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;

    background: #27272A;
    border-radius: 10px;
  }
}

.dpi-profiles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.dpi-profile-item {
  display: flex;
  align-items: center;
  padding: 15px 12px;
  border-radius: 24px;
  background: transparent;
  
  .profile-dpi {
    color: white;
    font-size: 16px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    flex: 1;
  }
  
  .profile-color {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    margin-right: 12px;
  }
  
  .profile-menu-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    padding: 0;
    color: #D4D4D8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: white;
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}

.action-btn {
  width: 100%;
  height: 48px;
  background: #27272A;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  
  svg {
    width: 24px;
    height: 24px;
    color: #D4D4D8;
  }
  
  &:hover {
    background: #3F3F46;
  }
}

// Responsive breakpoints
@media (max-width: 1440px) {
  .dpi-settings-panel {
    width: 350px;
    left: 2.5vw;
  }
}

@media (max-width: 1200px) {
  .dpi-settings-panel {
    width: 320px;
    left: 2vw;
  }
}

@media (max-width: 1024px) {
  .dpi-settings-panel {
    width: 300px;
    left: 1.5vw;
    top: calc(3vh + 70px);
  }
}
</style> 