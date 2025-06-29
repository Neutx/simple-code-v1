<template>
  <div class="key-remapping-mouse-display">
    <!-- Mouse Visualization with Labels -->
    <div class="mouse-section">
      <div class="mouse-glow"></div>
      
      <!-- Left side labels and lines -->
      <div class="label-group left-labels">
        <!-- Left Click -->
        <div class="label-item" :class="{ active: selectedKey === 'left-click' }" @click="selectKey('left-click')">
          <span class="label-text">Left click</span>
          <div class="label-line"></div>
          <div class="label-dot"></div>
        </div>
        
        <!-- Mouse Button 4 -->
        <div class="label-item" :class="{ active: selectedKey === 'mouse-button-4' }" @click="selectKey('mouse-button-4')">
          <span class="label-text">Mouse button 4</span>
          <div class="label-line"></div>
          <div class="label-dot"></div>
        </div>
        
        <!-- Mouse Button 5 -->
        <div class="label-item" :class="{ active: selectedKey === 'mouse-button-5' }" @click="selectKey('mouse-button-5')">
          <span class="label-text">Mouse button 5</span>
          <div class="label-line"></div>
          <div class="label-dot"></div>
        </div>
      </div>
      
      <!-- Mouse Container -->
      <div class="mouse-container">
        <img 
          :src="mouseImageSrc" 
          :alt="deviceModel + ' Mouse'"
          class="mouse-image"
          @error="handleImageError"
        />
      </div>
      
      <!-- Right side labels and lines -->
      <div class="label-group right-labels">
        <!-- Middle Click -->
        <div class="label-item" :class="{ active: selectedKey === 'middle-click' }" @click="selectKey('middle-click')">
          <div class="label-dot"></div>
          <div class="label-line"></div>
          <span class="label-text">Middle click</span>
        </div>
        
        <!-- Right Click -->
        <div class="label-item" :class="{ active: selectedKey === 'right-click' }" @click="selectKey('right-click')">
          <div class="label-dot"></div>
          <div class="label-line"></div>
          <span class="label-text">Right click</span>
        </div>
      </div>
    </div>

    <!-- Profile Selector -->
    <div class="profiles-wrapper" :class="{ expanded: profilesExpanded }">
      <!-- Active profile (always visible) -->
      <div
        class="profile-item active"
        @click="toggleProfiles"
      >
        <span>Profile {{ activeProfile }}</span>
        <div class="expand-icon" :class="{ rotated: profilesExpanded }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Other profiles (shown when expanded) -->
      <transition name="profiles-expand">
        <div v-if="profilesExpanded" class="other-profiles">
          <div
            v-for="index in profileCount"
            :key="index"
            v-show="index !== activeProfile"
            class="profile-item"
            @click="selectProfile(index)"
          >
            Profile {{ index }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeyRemappingMouseDisplay',
  props: {
    deviceModel: {
      type: String,
      default: 'Ikarus'
    },
    mouseImageSrc: {
      type: String,
      default: '/mice/ikarus.svg'
    }
  },
  data() {
    return {
      selectedKey: 'left-click',
      profilesExpanded: false,
      activeProfile: 1,
      profileCount: 4
    }
  },
  methods: {
    handleImageError(event) {
      event.target.src = '/mice/ikarus.svg'
    },
    selectKey(key) {
      this.selectedKey = key
      this.$emit('key-selected', key)
    },
    toggleProfiles() {
      this.profilesExpanded = !this.profilesExpanded
    },
    selectProfile(index) {
      this.activeProfile = index
      this.$emit('profile-selected', index)
      this.profilesExpanded = false // Collapse after selection
    }
  }
}
</script>

<style lang="scss" scoped>
.key-remapping-mouse-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.mouse-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 700px;
  height: auto;
  margin-bottom: 40px;
  padding: 0 100px;
}

.mouse-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%);
  border-radius: 50%;
  filter: blur(120px);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0.6;
}

.mouse-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.mouse-image {
  width: 275px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.4));
  transition: all 0.3s ease;
}

.label-group {
  display: flex;
  flex-direction: column;
  gap: 60px;
  z-index: 3;
  position: relative;
}

.left-labels {
  align-items: flex-end;
  margin-right: -35px;
}

.right-labels {
  align-items: flex-start;
  margin-left: -65px;
}

.label-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    .label-text {
      color: #A278FD;
    }
    
    .label-line {
      background: linear-gradient(90deg, rgba(162, 120, 253, 0.8), rgba(162, 120, 253, 0.3));
    }
    
    .label-dot {
      background: #A278FD;
      box-shadow: 0 0 20px rgba(162, 120, 253, 0.6);
    }
  }
  
  &.active {
    .label-text {
      color: #A278FD;
      font-weight: 600;
    }
    
    .label-line {
      background: linear-gradient(90deg, #A278FD, rgba(162, 120, 253, 0.4));
    }
    
    .label-dot {
      background: #A278FD;
      box-shadow: 0 0 25px rgba(162, 120, 253, 0.8);
      transform: scale(1.2);
    }
  }
}

.label-text {
  color: #D6D6D6;
  font-size: 16px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
  transition: all 0.3s ease;
  user-select: none;
}

.label-line {
  height: 2px;
  background: linear-gradient(90deg, rgba(214, 214, 214, 0.5), rgba(214, 214, 214, 0.2));
  transition: all 0.3s ease;
}

.label-dot {
  width: 10px;
  height: 10px;
  background: rgba(214, 214, 214, 0.8);
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

// Left side positioning
.left-labels {
  .label-item:nth-child(1) { // Left click
    margin-top: -100px;
  }
  
  .label-item:nth-child(2) { // Mouse button 4
    margin-top: -20px;
  }
  
  .label-item:nth-child(3) { // Mouse button 5
    margin-top: 10px;
  }
  
  .label-line {
    width: 80px;
    margin-left: 12px;
  }
  
  .label-dot {
    margin-left: 4px;
  }
}

// Right side positioning
.right-labels {
  .label-item:nth-child(1) { // Middle click
    margin-top: -150px;
  }
  
  .label-item:nth-child(2) { // Right click
    margin-top: -40px;
  }
  
  .label-line {
    width: 80px;
    margin-right: 12px;
  }
  
  .label-dot {
    margin-right: 8px;
  }
}

.profiles-wrapper {
  position: absolute;
  width: 144px;
  bottom: -50px;
  left: 55%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 3;
  transition: all 0.3s ease;

  &.expanded {
    bottom: -200px; // Adjust position when expanded to fit all profiles
  }
}

.profile-item {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-radius: 18px;
  background: rgba(39, 39, 42, 0.4);
  backdrop-filter: blur(16px);
  border: 2px solid #a278fd;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &.active {
    background: #27272a;
  }

  &:hover:not(.active) {
    background: rgba(39, 39, 42, 0.6);
  }
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;

  svg {
    font-size: 16px;
    color: white;
  }

  &.rotated {
    transform: rotate(180deg);
  }
}

.other-profiles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

// Transition animations for expanding/collapsing
.profiles-expand-enter-active,
.profiles-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.profiles-expand-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.profiles-expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.profiles-expand-enter-to,
.profiles-expand-leave-from {
  opacity: 1;
  max-height: 200px; // Adjust based on profile count
  transform: translateY(0);
}

// Responsive adjustments
@media (max-width: 1440px) {
  .mouse-section {
    padding: 0 80px;
  }
  
  .mouse-image {
    width: 160px;
  }
  
  .left-labels,
  .right-labels {
    .label-line {
      width: 60px;
    }
    
    gap: 50px;
  }
  
  .label-text {
    font-size: 15px;
  }
}

@media (max-width: 1024px) {
  .mouse-section {
    padding: 0 60px;
  }
  
  .mouse-image {
    width: 140px;
  }
  
  .left-labels,
  .right-labels {
    .label-line {
      width: 50px;
    }
    
    gap: 40px;
  }
  
  .label-text {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .mouse-section {
    padding: 0 40px;
    flex-direction: column;
    gap: 30px;
  }
  
  .mouse-image {
    width: 120px;
  }
  
  .left-labels,
  .right-labels {
    flex-direction: row;
    gap: 20px;
    margin: 0;
  }
  
  .label-item {
    flex-direction: column;
    text-align: center;
  }
  
  .label-line {
    width: 2px !important;
    height: 30px !important;
    margin: 8px 0 !important;
  }
  
  .label-text {
    font-size: 12px;
  }
}
</style> 