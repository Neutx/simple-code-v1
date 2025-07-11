<template>
  <transition name="slide-in" appear>
    <div class="key-remapping-panel-wrapper">
      <div class="key-remapping-panel" :class="{ 'is-expanded': selectedKey !== null }" v-if="!isCreatingMacro">
        <!-- Panel content -->
        <div class="panel-inner">
          <!-- Left column - Key Functions & Macros -->
          <div class="left-col">
            <!-- Key Functions Header -->
            <div class="panel-header">
              <h2 class="panel-title">Key function</h2>
              <p class="panel-description">
                Select a key to modify its functions
              </p>
            </div>

            <!-- Key Function List -->
            <div class="key-functions-section">
              <div
                v-for="(mapping, index) in keyMappings"
                :key="index"
                class="key-function-item"
                :class="{ 'active': selectedKey === mapping.key }"
                @click="selectKey(mapping.key)"
              >
                <span class="key-name">{{ mapping.name }}</span>
                <div class="arrow-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="separator"></div>

            <!-- Macros Selection Item -->
             <div class="key-function-item"
                 :class="{ 'active': selectedKey === 'macros' }"
                 @click="selectKey('macros')">
                <span class="key-name">Macros</span>
                <div class="arrow-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                              stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
          </div>

          <!-- Right column - Detail View for selected item -->
          <div class="right-col" v-if="selectedKey">
              <div class="detail-header">
                  <button class="back-button" @click="deselectKey">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Back
                  </button>
                  <h3 class="detail-title">{{ selectedKeyName }}</h3>
              </div>

              <!-- View for Key Functions -->
              <div class="detail-options" v-if="selectedKey !== 'macros'">
                  <div v-for="option in functionOptions" :key="option.value" 
                       class="option-item"
                       @click="selectFunction(selectedKey, option)">
                    <span class="option-name">{{ option.label }}</span>
                    <div class="option-arrow">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
              </div>

              <!-- View for Macros -->
              <div class="macros-view" v-if="selectedKey === 'macros'">
                  <p class="sub-description">Record or select a macro</p>
                  <!-- Add Macro Button -->
                  <div class="macro-add-section">
                    <button class="add-macro-btn" @click="promptForMacroName">
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
        
        <!-- Name Macro Modal -->
        <NameMacroModal 
          v-if="isNamingMacro" 
          @dismiss="cancelMacroName" 
          @confirm="saveNewMacro" 
        />
      </div>
      
      <!-- Create Macro View -->
      <CreateMacroView 
        v-if="isCreatingMacro"
        :macro-name="newMacroName"
        @back="goBackToNaming"
        @close="exitCreateMacroView"
        @type-selected="handleMacroTypeSelected"
        @save-macro="saveAndCloseMacro"
      />
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import NameMacroModal from './NameMacroModal.vue'
import CreateMacroView from './CreateMacroView.vue'

export default {
  name: 'KeyRemappingPanel',
  components: {
    NameMacroModal,
    CreateMacroView
  },
  data() {
    return {
      selectedKey: null,
      isRecording: false,
      isNamingMacro: false,
      isCreatingMacro: false, // Controls CreateMacroView visibility
      newMacroName: '', // To store the name for the new macro
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
    ...mapGetters('settings', ['keyMappings']),
    selectedKeyName() {
      if (!this.selectedKey) return '';
      if (this.selectedKey === 'macros') return 'Macros';
      const mapping = this.keyMappings.find(m => m.key === this.selectedKey);
      return mapping ? mapping.name : '';
    }
  },
  mounted() {
    this.loadKeyMappings()
  },
  methods: {
    selectKey(key) {
      this.selectedKey = key;
      this.$emit('panel-state-changed', { isExpanded: true, selectedKey: key });
    },
    deselectKey() {
      this.selectedKey = null;
      this.$emit('panel-state-changed', { isExpanded: false, selectedKey: null });
    },
    selectFunction(key, option) {
      const mapping = this.keyMappings.find(m => m.key === key);
      if (mapping) {
        mapping.value = option.value
        mapping.label = option.label
        
        // Emit update event
        this.$emit('key-mapping-update', {
          key: mapping.key,
          value: option.value,
          label: option.label
        })
      }
    },
    promptForMacroName() {
      this.isNamingMacro = true;
    },
    cancelMacroName() {
      this.isNamingMacro = false;
    },
    saveNewMacro(name) {
      this.newMacroName = name;
      this.isNamingMacro = false;
      this.isCreatingMacro = true; // Show the create macro view
    },
    goBackToNaming() {
      this.isCreatingMacro = false;
      this.isNamingMacro = true;
    },
    exitCreateMacroView() {
      this.isCreatingMacro = false;
      this.newMacroName = '';
    },
    handleMacroTypeSelected(typeId) {
      if (typeId === 'toggle') {
        console.log(`Toggle macro selected for: ${this.newMacroName}`);
        // Handle toggle-specific logic, for now just close
        this.exitCreateMacroView();
      }
      // Other types are handled within CreateMacroView itself
    },
    toggleRecording() {
      // This method's logic might change or be removed depending on the new flow
      // For now, let's keep it but the primary action is promptForMacroName
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
    },
    saveAndCloseMacro(macroData) {
      const existingIndex = this.macros.findIndex(m => m.name === macroData.name);
      if (existingIndex !== -1) {
          // Update existing macro
          this.$set(this.macros, existingIndex, macroData);
      } else {
          // Add new macro
          this.macros.push(macroData);
      }
      this.exitCreateMacroView();
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

.key-remapping-panel-wrapper {
  /* This wrapper ensures the transition applies correctly */
  position: relative;
  width: 100%;
  height: 100%;
}

.key-remapping-panel {
  position: fixed;
  left: 3vw;
  top: calc(10vh + 80px);
  bottom: 100px;
  width: 380px; /* Initial narrow width */
  background: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 34px 24px 24px 24px;
  z-index: 20;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth transition for width */

  &.is-expanded {
    width: 784px; /* Expanded width */
  }

  &::-webkit-scrollbar {
    display: none;
  }

  .panel-inner {
    display: flex;
    gap: 24px;
    width: 100%;
  }

  .left-col {
    width: 100%;
    flex-shrink: 0;
  }
  
  &.is-expanded .left-col {
    width: 332px; /* Fixed width for left col when expanded */
  }

  .right-col {
    flex: 1;
    min-width: 0;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  &.is-expanded .right-col {
    opacity: 1;
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
  
  &:hover, &.active {
    background: rgba(255, 255, 255, 0.05);
  }

  .key-name {
    color: white;
    font-size: 16px;
    font-weight: 500;
  }

  .arrow-icon {
    color: rgba(255, 255, 255, 0.5);
  }
}

.option-item {
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
  
  .option-name {
    color: white;
    font-size: 16px;
    font-weight: 400;
  }
  .option-arrow {
    color: rgba(255, 255, 255, 0.5);
  }
}

.separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.macros-view {
  margin-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 32px;
}

.sub-description {
  color: rgba(255, 255, 255, 0.50);
  font-size: 14px;
  margin: 0 0 24px 0;
}

.macro-add-section {
  margin-bottom: 24px;
}

.add-macro-btn {
  width: 100%;
  height: 64px;
  background: #8B5CF6;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #7C3AED;
  }

  .plus-icon {
    color: white;
  }
}

.macro-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.macro-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.macro-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-name {
  color: white;
  font-weight: 500;
}

.macro-keys {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.macro-menu-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;

  &:hover {
    color: white;
  }
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
}

.back-button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
    }
}

.detail-title {
    color: white;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.detail-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

</style> 