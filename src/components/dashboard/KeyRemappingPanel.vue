<template>
  <transition name="slide-in" appear>
    <div class="key-remapping-panel">
      <!-- Panel content split into two columns -->
      <div class="panel-inner">
        <!-- Left column - Key Functions -->
        <div class="left-col">
          <!-- Header -->
          <div class="panel-header">
            <h2 class="panel-title">Key function</h2>
            <p class="panel-description">
              Select a key to modify its functions
            </p>
          </div>

          <!-- Key Function List -->
          <div class="key-functions-section">
            <div v-for="(mapping, index) in keyMappings" :key="index" class="key-function-group">
              <!-- Main key button -->
              <div class="key-function-item" 
                   :class="{ 'active': openDropdown === mapping.key }"
                   @click="toggleDropdown(mapping.key)">
                <span class="key-name">{{ mapping.name }}</span>
                <div class="arrow-icon" :class="{ rotated: openDropdown === mapping.key }">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <!-- Options appear inline when expanded -->
              <template v-if="openDropdown === mapping.key">
                <div v-for="option in functionOptions" :key="option.value" 
                     class="option-item"
                     @click="selectFunction(mapping, option)">
                  <span class="option-name">{{ option.label }}</span>
                  <div class="option-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right column - Macros -->
        <div class="right-col">
          <h3 class="sub-header">Macros</h3>
          <p class="sub-description">Record or select a macro</p>

          <!-- Add Macro Button -->
          <div class="macro-add-section">
            <button class="add-macro-btn" @click="toggleRecording">
              <div class="plus-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </button>
          </div>

          <!-- Existing Macros List -->
          <div class="macro-list" v-if="macros.length > 0">
            <div v-for="(macro, index) in macros" :key="index" class="macro-item">
              <div class="macro-info">
                <span class="macro-name">{{ macro.name }}</span>
                <span class="macro-keys">{{ macro.keys.join(' + ') }}</span>
              </div>
              <button class="macro-menu-btn" @click="toggleMacroMenu(index)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'KeyRemappingPanel',
  data() {
    return {
      openDropdown: null,
      isRecording: false,
      selectedMacroIndex: -1,
      keyMappings: [
        { key: 'left-click', name: 'Left click', function: 'left-click' },
        { key: 'right-click', name: 'Right click', function: 'right-click' },
        { key: 'middle-click', name: 'Middle click', function: 'middle-click' },
        { key: 'mouse-button-4', name: 'Mouse button 4', function: 'back' },
        { key: 'mouse-button-5', name: 'Mouse button 5', function: 'forward' }
      ],
      functionOptions: [
        { value: 'left-click', label: 'Left click' },
        { value: 'right-click', label: 'Right click' },
        { value: 'middle-click', label: 'Middle click' },
        { value: 'back', label: 'Back' },
        { value: 'forward', label: 'Forward' },
        { value: 'dpi-up', label: 'DPI Up' },
        { value: 'dpi-down', label: 'DPI Down' },
        { value: 'dpi-cycle', label: 'DPI Cycle' },
        { value: 'profile-cycle', label: 'Profile Cycle' },
        { value: 'macro', label: 'Macro' },
        { value: 'disabled', label: 'Disabled' }
      ],
      macros: [
        { name: 'Gaming Combo', keys: ['Ctrl', 'Shift', 'R'] },
        { name: 'Quick Save', keys: ['Ctrl', 'S'] }
      ]
    }
  },
  computed: {
    ...mapGetters('settings', ['keyMappings'])
  },
  mounted() {
    this.loadKeyMappings()
  },
  methods: {
    toggleDropdown(key) {
      this.openDropdown = this.openDropdown === key ? null : key
    },
    selectFunction(mapping, option) {
      mapping.function = option.value
      this.openDropdown = null
      
      // Update the mapping in the store
      const updatedMappings = { ...this.$store.getters['settings/keyMappings'] }
      updatedMappings[mapping.key] = option.value
      this.$store.dispatch('settings/updateKeyMappings', updatedMappings)
      
      this.$emit('key-mapping-updated', { key: mapping.key, function: option.value })
      console.log('Function selected:', mapping.key, '->', option.value)
    },
    toggleRecording() {
      this.isRecording = !this.isRecording
      console.log('Toggle macro recording:', this.isRecording)
      // Implement macro recording logic
    },
    toggleMacroMenu(index) {
      this.selectedMacroIndex = this.selectedMacroIndex === index ? -1 : index
    },
    loadKeyMappings() {
      // Load existing key mappings from store
      const storedMappings = this.$store.getters['settings/keyMappings']
      this.keyMappings.forEach(mapping => {
        if (storedMappings[mapping.key]) {
          mapping.function = storedMappings[mapping.key]
        }
      })
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

.key-remapping-panel {
  position: fixed;
  left: 3vw;
  top: calc(10vh + 80px);
  bottom: 100px;
  width: 784px;
  background: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 34px 24px 24px 24px;
  z-index: 20;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    display: none;
  }

  .panel-inner {
    display: flex;
    gap: 24px;
    width: 100%;
  }

  .left-col {
    flex: 1 1 50%;
  }

  .right-col {
    flex: 1 1 50%;
  }
}

.panel-header {
  margin-bottom: 32px;
}

.panel-title {
  color: white;
  font-size: 30px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  margin: 0 0 16px 0;
}

.panel-description {
  color: rgba(255, 255, 255, 0.50);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
}

.key-functions-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.key-function-item {
  min-height: 48px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    background: rgba(39, 39, 42, 0.8);
  }
}

.option-item {
  min-height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px 0 30px;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.key-name {
  color: #D6D6D6;
  font-size: 20px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}

.option-name {
  color: rgba(214, 214, 214, 0.8);
  font-size: 18px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  color: #D6D6D6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  
  &.rotated {
    transform: rotate(180deg);
  }
  
  svg {
    width: 100%;
    height: 100%;
  }
}

.option-arrow {
  width: 20px;
  height: 20px;
  color: rgba(214, 214, 214, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
}

/* Right column styles */
.sub-header {
  color: white;
  font-size: 30px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 12px;
}

.sub-description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 32px;
  line-height: 1.4;
}

.macro-add-section {
  margin-bottom: 32px;
}

.add-macro-btn {
  width: 64px;
  height: 64px;
  background: #A278FD;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #9366FC;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.plus-icon {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.macro-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.macro-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(39, 39, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(63, 63, 70, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.macro-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
}

.macro-keys {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
}

.macro-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
}

// Responsive adjustments
@media (max-width: 1440px) {
  .key-remapping-panel {
    width: 700px;
    left: 2vw;
  }
}

@media (max-width: 1024px) {
  .key-remapping-panel {
    width: 640px;
    left: 1vw;
    
    .panel-inner {
      flex-direction: column;
      gap: 32px;
    }
  }
  
  .panel-title,
  .sub-header {
    font-size: 26px;
  }
}
</style> 