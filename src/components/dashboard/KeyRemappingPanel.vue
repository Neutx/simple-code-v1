<template>
  <transition name="slide-in" appear>
    <div class="key-remapping-panel-wrapper">
      <div class="key-remapping-panel" :class="{ 'is-expanded': selectedKey !== null, 'is-inactive': !isOnline }" v-if="!isCreatingMacro">
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
                  <button class="back-button" @click="deselectKey" aria-label="Back">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                  </button>
                  <h3 class="detail-title">{{ selectedKeyName }}</h3>
              </div>

              <!-- View for Key Functions -->
              <div class="detail-options" v-if="selectedKey !== 'macros'">
                  <div v-for="option in functionOptions" :key="option.value">
                    <!-- Option Row -->
                    <div class="option-item"
                         @click="selectFunction(selectedKey, option)">
                      <span class="option-name">{{ option.label }}</span>
                      <div class="option-arrow" :class="{ 'expanded': option.value === 'macro' && showMacroList }">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    <!-- Inline Macro List (directly under Macro option) -->
                    <transition name="fade" mode="out-in" v-if="option.value === 'macro'">
                      <div v-if="showMacroList" class="macro-selection-list">
                        <div v-for="macro in macros" :key="macro.id" class="macro-option-item" @click="handleMacroSelected(macro)">
                          <span class="macro-option-name">{{ macro.name }}</span>
                        </div>
                        <div v-if="!isLoading && macros.length === 0" class="empty-state small">No macros saved</div>
                      </div>
                    </transition>
                  </div>
                  
                  <!-- Macro Selection List END -->
                 </div>

              <!-- View for Macros -->
              <div class="macros-view" v-if="selectedKey === 'macros'">
                  <p class="sub-description">Record or select a macro</p>
                  
                  <!-- Loading state -->
                  <div v-if="isLoading" class="loading-state">
                    <div class="loading-spinner"></div>
                    <span>Loading macros...</span>
                  </div>
                  
                  <!-- Syncing state -->
                  <div v-if="isSyncing" class="syncing-state">
                    <div class="syncing-spinner"></div>
                    <span>Syncing with cloud...</span>
                  </div>
                  
                  <!-- Error state -->
                  <div v-if="error" class="error-state">
                    <span>{{ error }}</span>
                  </div>
                  
                  <!-- Add Macro Button -->
                  <div class="macro-add-section">
                    <button class="add-macro-btn" @click="promptForMacroName" :disabled="isSyncing">
                      <div class="plus-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </div>
                    </button>
                  </div>

                  <!-- Existing Macros List -->
                  <div class="macro-list" v-if="macros.length > 0">
                    <div v-for="(macro, index) in macros" :key="macro.id || index" class="macro-item">
                      <div class="macro-info">
                        <span class="macro-name">{{ macro.name }}</span>
                        <span class="macro-keys">{{ getMacroDisplayText(macro) }}</span>
                        <span class="macro-meta">{{ formatMacroDate(macro.createdAt) }}</span>
                      </div>
                      <div class="macro-actions">
                        <button class="macro-menu-btn" @click="toggleMacroMenu(index)" :disabled="isSyncing">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                            <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                          </svg>
                        </button>
                        <div v-if="selectedMacroIndex === index" class="macro-menu">
                          <button @click="showDeleteConfirmation(macro.id, macro.name)" class="delete-btn" :disabled="isSyncing">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Empty state -->
                  <div v-if="!isLoading && macros.length === 0" class="empty-state">
                    <p>No macros created yet. Click the + button to create your first macro!</p>
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
        
        <!-- Delete Confirmation Dialog -->
        <div v-if="showDeleteDialog" class="delete-confirmation-overlay">
          <div class="delete-confirmation-dialog">
            <div class="delete-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="#FF6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3>Delete</h3>
            </div>
            <p class="delete-message">
              Are you sure that you want to delete macro - {{ macroToDelete && macroToDelete.name }}?
            </p>
            <div class="delete-actions">
              <button class="cancel-btn" @click="cancelDelete">Cancel</button>
              <button class="confirm-delete-btn" @click="confirmDelete" :disabled="isSyncing">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Inactivity Overlay -->
      <div v-if="!isOnline && !isCreatingMacro" class="inactivity-overlay">
        <div class="inactivity-message">
            <div class="mouse-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5C8.13401 5 5 8.13401 5 12V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V12C19 8.13401 15.866 5 12 5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 5V2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 3H15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 12H7.01" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17 12H17.01" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h3>Mouse is asleep</h3>
            <p>Shake your mouse to wake it up.</p>
        </div>
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
import { mapGetters, mapActions } from 'vuex'
import NameMacroModal from './NameMacroModal.vue'
import CreateMacroView from './CreateMacroView.vue'
import HIDHandle from '@/assets/js/HIDHandle'

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
      selectedFunction: null, // Track which function is selected for the current key
      selectedMacroId: null, // Track selected macro id
      showDeleteDialog: false, // Track delete confirmation dialog
      macroToDelete: null, // Track macro to be deleted
      isSaving: false, // Track saving state
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
      ]
    }
  },
  computed: {
    ...mapGetters('settings', ['keyMappings']),
    ...mapGetters('macros', ['allMacros', 'isLoading', 'isSyncing', 'error']),
    ...mapGetters('device', ['isConnected', 'isOnline']),
    
    macros() {
      return this.allMacros
    },
    showMacroList() {
      return this.selectedFunction === 'macro'
    },
    
    selectedKeyName() {
      if (!this.selectedKey) return '';
      if (this.selectedKey === 'macros') return 'Macros';
      const mapping = this.keyMappings.find(m => m.key === this.selectedKey);
      return mapping ? mapping.name : '';
    }
  },
  async mounted() {
    this.loadKeyMappings()
    
    // Load macros from Firebase when component mounts
    try {
      await this.loadMacros()
      console.log('Macros loaded successfully:', this.macros.length)
    } catch (error) {
      console.error('Error loading macros:', error)
    }
    
    // Import any existing localStorage macros to Firebase (one-time migration)
    if (this.macros.length === 0) {
      try {
        await this.importMacrosFromLocalStorage()
        console.log('Imported macros from localStorage')
      } catch (error) {
        console.error('Error importing macros from localStorage:', error)
      }
    }

    this.updateButtonLabelsFromDevice()
    
    this.$bus.$on("updateMouseUI", () => {
      this.updateButtonLabelsFromDevice()
    })
  },
  beforeDestroy() {
    // Clean up event listener
    this.$bus.$off("updateMouseUI")
  },
  methods: {
    ...mapActions('macros', [
      'loadMacros',
      'saveMacro',
      'updateMacro',
      'deleteMacro',
      'importMacrosFromLocalStorage'
    ]),
    
    updateButtonLabelsFromDevice() {
      if (!this.isConnected || !HIDHandle.deviceInfo.mouseCfg.keys) {
        return
      }

      // Update each button's display name based on current device configuration
      this.keyMappings.forEach((mapping, index) => {
        if (index < HIDHandle.deviceInfo.mouseCfg.keys.length) {
          const deviceKey = HIDHandle.deviceInfo.mouseCfg.keys[index]
          if (deviceKey && deviceKey.length >= 2) {
            const functionType = parseInt(deviceKey[0], 16)
            const functionParam = deviceKey[1]
            
            // Get user-friendly label for current device function
            const currentLabel = this.getDeviceFunctionLabel(functionType, functionParam, index)
            
            // Update the mapping name to show current assignment
            mapping.name = currentLabel
          }
        }
      })

      // Force reactivity update
      this.$forceUpdate()
    },

    getDeviceFunctionLabel(functionType, functionParam, buttonIndex) {
      // Map device function types to user-friendly labels
      switch (functionType) {
        case HIDHandle.MouseKeyFunction.Disable:
          return this.getDefaultButtonName(buttonIndex) + ' (Disabled)'
          
        case HIDHandle.MouseKeyFunction.MouseKey:
          return this.getMouseKeyLabel(functionParam)
          
        case HIDHandle.MouseKeyFunction.DPISwitch:
          return this.getDefaultButtonName(buttonIndex) + ' (DPI Cycle)'
          
        case HIDHandle.MouseKeyFunction.FireKey:
          return this.getDefaultButtonName(buttonIndex) + ' (Fire Key)'
          
        case HIDHandle.MouseKeyFunction.ShortcutKey:
          return this.getDefaultButtonName(buttonIndex) + ' (Shortcut)'
          
        case HIDHandle.MouseKeyFunction.Macro: {
          // Get macro name from device macros
          const macroName = this.getMacroNameFromDevice(buttonIndex)
          return macroName ? `${this.getDefaultButtonName(buttonIndex)} (${macroName})` 
                          : this.getDefaultButtonName(buttonIndex) + ' (Macro)'
        }
          
        case HIDHandle.MouseKeyFunction.ReportRateSwitch:
          return this.getDefaultButtonName(buttonIndex) + ' (Polling Rate)'
          
        case HIDHandle.MouseKeyFunction.LightSwitch:
          return this.getDefaultButtonName(buttonIndex) + ' (Light Toggle)'
          
        case HIDHandle.MouseKeyFunction.ProfileSwitch:
          return this.getDefaultButtonName(buttonIndex) + ' (Profile Cycle)'
          
        case HIDHandle.MouseKeyFunction.DPILock:
          return this.getDefaultButtonName(buttonIndex) + ' (DPI Lock)'
          
        case HIDHandle.MouseKeyFunction.UpDownRoll:
          return this.getDefaultButtonName(buttonIndex) + ' (Scroll)'
          
        default:
          return this.getDefaultButtonName(buttonIndex)
      }
    },

    getMouseKeyLabel(functionParam) {
      const param = typeof functionParam === 'string' ? parseInt(functionParam, 16) : functionParam
      
      switch (param) {
        case 0x0100:
          return 'Left click'
        case 0x0200:
          return 'Right click'
        case 0x0400:
          return 'Middle click'
        case 0x0800:
          return 'Mouse button 4 (Back)'
        case 0x1000:
          return 'Mouse button 5 (Forward)'
        default:
          return 'Mouse function'
      }
    },

    getMacroNameFromDevice(buttonIndex) {
      // Get macro name from device's macro configuration
      if (HIDHandle.deviceInfo.mouseCfg.macros && 
          HIDHandle.deviceInfo.mouseCfg.macros[buttonIndex] && 
          HIDHandle.deviceInfo.mouseCfg.macros[buttonIndex].name) {
        return HIDHandle.deviceInfo.mouseCfg.macros[buttonIndex].name
      }
      return null
    },

    getDefaultButtonName(buttonIndex) {
      // Return default button names
      const defaultNames = [
        'Left click',
        'Right click', 
        'Middle click',
        'Mouse button 4',
        'Mouse button 5'
      ]
      
      return defaultNames[buttonIndex] || `Button ${buttonIndex + 1}`
    },
    
    selectKey(key) {
      this.selectedKey = key;
      this.$emit('panel-state-changed', { isExpanded: true, selectedKey: key });
    },
    deselectKey() {
      this.selectedKey = null;
      this.selectedFunction = null;
      this.selectedMacroId = null;
      this.$emit('panel-state-changed', { isExpanded: false, selectedKey: null });
    },
    selectFunction(key, option) {
      if (option.value === 'macro') {
        // Toggle macro list visibility
        this.selectedFunction = this.selectedFunction === 'macro' ? null : 'macro'
        // Do not emit mapping change until user picks a macro
        return
      }

      const mapping = this.keyMappings.find(m => m.key === key)
      if (!mapping) return

      mapping.value = option.value
      mapping.label = option.label
      this.selectedFunction = option.value
      this.selectedMacroId = null

      // Emit update immediately for non-macro options
      this.$emit('key-mapping-update', {
        key: mapping.key,
        value: option.value,
        label: option.label,
        macroId: null
      })
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
    async saveAndCloseMacro(macroData) {
      console.log('Saving macro:', macroData);
      
      try {
        // Show loading state
        this.isSaving = true;
        
        // Save to Firebase using the new macro store
        await this.saveMacro(macroData);
        
        // Small delay to prevent UI crash
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Emit the updateMacroList event for backward compatibility with legacy system
        this.$bus.$emit("updateMacroList", this.macros);
        
        console.log('Macro saved successfully to Firebase');
        
        // Exit create macro view
        this.exitCreateMacroView();
        
      } catch (error) {
        console.error('Error saving macro:', error);
        // Show error message but don't crash
        this.error = 'Failed to save macro. Please try again.';
      } finally {
        this.isSaving = false;
      }
    },
    
    // Remove the old localStorage methods since we're using Firebase now
    getMacroDisplayText(macro) {
      // Handle both old format (macro.keys) and new format (macro.actions)
      if (macro.actions && macro.actions.length > 0) {
        // New format: show first few key presses
        const keyPresses = macro.actions
          .filter(action => action.type === '↓') // Only show key down events
          .slice(0, 3) // Show max 3 keys
          .map(action => action.key);
        
        if (keyPresses.length === 0) {
          return 'No keys recorded';
        }
        
        let display = keyPresses.join(' + ');
        if (macro.actions.filter(action => action.type === '↓').length > 3) {
          display += '...';
        }
        return display;
      } else if (macro.keys && macro.keys.length > 0) {
        // Old format: fallback
        return macro.keys.join(' + ');
      } else {
        return 'No keys recorded';
      }
    },
    
    showDeleteConfirmation(macroId, macroName) {
      this.macroToDelete = { id: macroId, name: macroName };
      this.showDeleteDialog = true;
      // Close the three-dot menu
      this.selectedMacroIndex = -1;
    },
    
    cancelDelete() {
      this.showDeleteDialog = false;
      this.macroToDelete = null;
    },
    
    async confirmDelete() {
      if (!this.macroToDelete) return;
      
      try {
        await this.deleteMacro(this.macroToDelete.id);
        console.log('Macro deleted successfully');
        
        // Emit the updateMacroList event for backward compatibility
        this.$bus.$emit("updateMacroList", this.macros);
        
        // Close dialog
        this.showDeleteDialog = false;
        this.macroToDelete = null;
        
      } catch (error) {
        console.error('Error deleting macro:', error);
        this.error = 'Failed to delete macro. Please try again.';
      }
    },

    handleMacroSelected(macro) {
      this.selectedMacroId = macro.id
      // Collapse the macro list after selection
      this.selectedFunction = null

      // Update the key mapping with the selected macro
      const mapping = this.keyMappings.find(m => m.key === this.selectedKey)
      if (mapping) {
        mapping.value = 'macro'
        mapping.label = `Macro: ${macro.name}`

        // Emit update event with macro information
        this.$emit('key-mapping-update', {
          key: mapping.key,
          value: 'macro',
          label: `Macro: ${macro.name}`,
          macroId: macro.id,
          macroData: macro
        })
      }

      console.log('Macro selected for key:', this.selectedKey, macro.name)
    },

    formatMacroDate(timestamp) {
      if (!timestamp) return '';
      // Handle Firebase timestamp
      if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      // Handle regular timestamp
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
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
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), filter 0.3s ease; /* Smooth transition for width */

  &.is-expanded {
    width: 784px; /* Expanded width */
  }

  &.is-inactive {
    filter: blur(8px);
    pointer-events: none;
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

.inactivity-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inactivity-message {
  background: rgba(40, 40, 40, 0.85);
  backdrop-filter: blur(5px);
  padding: 32px 48px;
  border-radius: 16px;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  .mouse-icon {
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.8);
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 22px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
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
    &.expanded {
      transform: rotate(90deg);
      transition: transform 0.2s ease;
    }
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

  &:disabled {
    background: rgba(139, 92, 246, 0.5);
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);
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

.macro-meta {
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.macro-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.macro-menu-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;

  &:hover {
    color: white;
  }

  &:disabled {
    color: rgba(255, 255, 255, 0.2);
    cursor: not-allowed;
  }
}

.macro-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  min-width: 120px;
}

.delete-btn {
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  color: #FF6B6B;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 107, 107, 0.1);
  }

  &:disabled {
    color: rgba(255, 107, 107, 0.5);
    cursor: not-allowed;
  }
}

/* Delete Confirmation Dialog */
.delete-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-confirmation-dialog {
  background: rgba(40, 40, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  color: white;
  font-family: 'DM Sans', sans-serif;
}

.delete-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #FF6B6B;
  }
}

.delete-message {
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

.delete-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.confirm-delete-btn {
  padding: 10px 20px;
  background: #DC2626;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #B91C1C;
  }
  
  &:disabled {
    background: rgba(220, 38, 38, 0.5);
    cursor: not-allowed;
  }
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-top: 20px;
}

.loading-state, .syncing-state, .error-state {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-bottom: 24px;
}

.loading-spinner, .syncing-spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.macro-selection-section {
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  font-family: 'DM Sans', sans-serif;
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

/* Inline macro list styles */
/* Macro sub-menu positioning */
.macro-selection-list {
  margin-top: 6px;
  margin-left: 24px; /* indent to the right */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-option-item {
  min-height: 48px;
  padding: 0 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #fff;
  font-size: 16px; /* match option list */
  background: transparent;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.empty-state.small {
  font-size: 12px;
  padding: 6px 12px;
  color: rgba(255,255,255,0.6);
}

/* Fade transition for inline macro list */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style> 