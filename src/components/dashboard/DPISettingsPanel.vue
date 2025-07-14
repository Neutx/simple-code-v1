<template>
  <div>
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
          <div class="dropdown-wrapper" ref="dropdownWrapper">
          <div class="dropdown-container" @click="toggleDropdown">
              <span class="dropdown-value">{{ selectedModeText }}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="dropdown-icon" :class="{ rotated: dropdownOpen }">
              <path d="M7 10L12 15L17 10" stroke="#D4D4D8" stroke-width="1.5" />
            </svg>
          </div>
          <!-- Dropdown Options -->
          <transition name="dropdown">
            <div v-if="dropdownOpen" class="dropdown-options">
              <div 
                  v-for="item in lightModes" 
                  :key="item.value"
                class="dropdown-option"
                  @click.stop="selectMode(item.value)"
              >
                  {{ item.option }}
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- DPI Light Brightness -->
        <div class="slider-section" :class="{ disabled: isBrightnessDisabled }">
        <label class="slider-label">DPI light brightness</label>
        <div class="slider-container">
          <div class="slider-track" @click="handleBrightnessTrackClick">
              <div class="slider-fill" :style="{ width: ((brightness - 1) / 9 * 100) + '%' }"></div>
          </div>
          <div class="slider-numbers">
            <span
              v-for="num in 10"
              :key="num"
              class="slider-number"
                :class="{ active: num === brightness }"
                @click="handleBrightnessChange(num)"
            >
              {{ num }}
            </span>
          </div>
        </div>
      </div>

      <!-- DPI Light Speed -->
        <div class="slider-section" :class="{ disabled: isSpeedDisabled }">
        <label class="slider-label">DPI light speed</label>
        <div class="slider-container">
          <div class="slider-track" @click="handleSpeedTrackClick">
              <div class="slider-fill" :style="{ width: ((speed - 1) / 4 * 100) + '%' }"></div>
          </div>
          <div class="slider-numbers">
            <span
                v-for="num in 5"
              :key="num"
              class="slider-number"
                :class="{ active: num === speed }"
                @click="handleSpeedChange(num)"
            >
              {{ num }}
            </span>
          </div>
        </div>
      </div>

      <!-- Max DPI Profiles -->
      <div class="profile-section">
          <div class="setting-row">
            <label class="setting-label">Max DPI profiles</label>
            <div class="dropdown-wrapper" ref="maxProfilesDropdownWrapper">
              <div class="dropdown-container" @click="toggleMaxProfilesDropdown">
                <span class="dropdown-value">{{ maxDpiProfiles }}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="dropdown-icon" :class="{ rotated: maxProfilesDropdownOpen }">
                  <path d="M7 10L12 15L17 10" stroke="#D4D4D8" stroke-width="1.5" />
                </svg>
              </div>
              <!-- Dropdown Options -->
              <transition name="dropdown">
                <div v-if="maxProfilesDropdownOpen" class="dropdown-options">
                  <div 
                    v-for="num in 8" 
                    :key="num"
                    class="dropdown-option"
                    @click.stop="selectMaxProfiles(num)"
                  >
                    {{ num }}
                  </div>
                </div>
              </transition>
            </div>
        </div>

        <!-- DPI Profile List -->
        <div class="dpi-profiles">
            <div 
              v-for="(profile, index) in dpiProfiles" 
              :key="index" 
              class="dpi-profile-item"
              :class="{ 
                disabled: index >= maxDpiProfiles,
                selected: index === selectedDpiIndex 
              }"
              @click="selectDpiProfile(index)"
              @dblclick="startEditing(index, true)"
            >
              <input 
                v-if="editingIndex === index"
                type="number" 
                :value="profile.dpi"
                @input="updateDpiValue(index, $event.target.value)"
                @blur="stopEditing"
                @keyup.enter="stopEditing"
                :min="50"
                :max="26000"
                class="profile-dpi-input editing"
                ref="dpiInput"
              />
              <span 
                v-else
                class="profile-dpi-display"
                :class="{ disabled: index >= maxDpiProfiles }"
              >
                {{ profile.dpi }}
              </span>
              
              <div 
                class="profile-color" 
                :style="{ backgroundColor: profile.color }"
                @click.stop="openColorPicker(index)"
                :class="{ disabled: index >= maxDpiProfiles || index !== selectedDpiIndex }"
              ></div>
              
              <button 
                class="profile-edit-btn"
                :disabled="index >= maxDpiProfiles || index !== selectedDpiIndex"
                @click.stop="startEditing(index)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

          <!-- Reset Button -->
        <div class="action-buttons">
            <button class="action-btn reset-btn" @click="resetToDefault">
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

    <!-- Color Picker Modal -->
    <ColorPicker 
      ref="colorPicker"
      :visible="colorPickerVisible"
      :initial-color="selectedProfileColor"
      @close="closeColorPicker"
      @color-selected="handleColorSelected"
    />
  </div>
</template>

<script>
import HIDHandle from '@/assets/js/HIDHandle';
import ColorPicker from './ColorPicker.vue';

export default {
  name: 'DPISettingsPanel',
  components: {
    ColorPicker
  },
  data() {
    return {
      deviceInfo: HIDHandle.deviceInfo,
      dropdownOpen: false,
      maxProfilesDropdownOpen: false,
      updatingFromParent: false, // Flag to prevent circular updates
      lightModes:[
        { value:0, option:"Off" },
        { value:1, option:"Steady" },
        { value:2, option:"Breathing" }
      ],
      mode: 1,
      brightness: 5,
      speed: 1,
      maxDpiProfiles: 4,
      editingIndex: -1, // Which DPI is being edited
      colorPickerVisible: false,
      selectedProfileIndex: 0,
      selectedProfileColor: '#EF4444',
      colorPickerPosition: { x: 0, y: 0 },
      dpiProfiles: [
        { dpi: 800, color: '#EF4444' },
        { dpi: 1200, color: '#10B981' },
        { dpi: 1600, color: '#FDE047' },
        { dpi: 1800, color: '#06B6D4' },
        { dpi: 2000, color: '#4F46E5' },
        { dpi: 5000, color: '#EC4899' },
        { dpi: 5400, color: '#64748B' },
        { dpi: 8000, color: '#F59E0B' }
      ]
    }
  },
  watch: {
    maxDpiProfiles(newMax) {
      if (!this.updatingFromParent) {
        this.$emit('max-profiles-updated', newMax);
      }
      // Ensure selectedDpiIndex is not out of bounds
      if (this.selectedDpiIndex >= newMax) {
        // The device state will handle the reset, no need to manually set it here.
      }
    },
    // Watch for parent prop changes
    parentDpiProfiles: {
      handler(newProfiles) {
        if (newProfiles && JSON.stringify(newProfiles) !== JSON.stringify(this.dpiProfiles)) {
          this.updatingFromParent = true;
          this.dpiProfiles = [...newProfiles];
          console.log('📥 DPI Settings Panel: Updated from parent props', newProfiles);
          this.$nextTick(() => {
            this.updatingFromParent = false;
          });
        }
      },
      immediate: true
    },
    parentMaxDpiProfiles: {
      handler(newMax) {
        if (newMax !== null && newMax !== this.maxDpiProfiles) {
          this.updatingFromParent = true;
          this.maxDpiProfiles = newMax;
          this.$nextTick(() => {
            this.updatingFromParent = false;
          });
        }
      },
      immediate: true
    },
    parentSelectedDpiIndex: {
      handler(newIndex) {
        if (newIndex !== null && newIndex !== this.selectedDpiIndex) {
          this.updatingFromParent = true;
          // this.selectedDpiIndex = newIndex; // Replaced by computed property
          this.$nextTick(() => {
            this.updatingFromParent = false;
          });
        }
      },
      immediate: true
    }
  },
   computed: {
    selectedDpiIndex() {
      return this.deviceInfo.mouseCfg?.currentDpi ?? 0;
    },
    selectedModeText() {
      const selected = this.lightModes.find(m => m.value === this.mode);
      return selected ? selected.option : 'Off';
    },
    isBrightnessDisabled() {
      return this.mode !== 1;
    },
    isSpeedDisabled() {
      return this.mode !== 2;
    }
  },
  methods: {
    // Add method to update selected DPI from external source
    // updateSelectedDpi(index) {
    //   // this.selectedDpiIndex = index; // Replaced by computed property
    // },
    
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    toggleMaxProfilesDropdown() {
      this.maxProfilesDropdownOpen = !this.maxProfilesDropdownOpen
    },
    async selectMaxProfiles(num) {
      this.maxDpiProfiles = num;
      this.maxProfilesDropdownOpen = false;
      
      // Update device with new max DPI setting
      try {
        await HIDHandle.Set_MS_MaxDPI(num);
        console.log('✅ Max DPI profiles updated on device:', num);
        
        let newDpiIndex = this.selectedDpiIndex;
        // If current selection is beyond new max, reset to first profile and update device
        if (this.selectedDpiIndex >= num) {
          newDpiIndex = 0;
          await HIDHandle.Set_MS_CurrentDPI(0);
          console.log('✅ Current DPI reset to 0 due to max change');
        }
        
        // Update device state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg) {
          HIDHandle.deviceInfo.mouseCfg.maxDpiStage = num;
          HIDHandle.deviceInfo.mouseCfg.currentDpi = newDpiIndex;
        }
        
        // Emit update event
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
      } catch (error) {
        console.error('Error updating max DPI on device:', error);
      }
    },
    async selectDpiProfile(index) {
      if (index >= this.maxDpiProfiles) return;
      
      // The UI will update reactively from HIDHandle.deviceInfo
      
      // Update device to use this DPI profile (current DPI)
      try {
        await HIDHandle.Set_MS_CurrentDPI(index);
        console.log('✅ Current DPI updated on device to index:', index);
        
        // Update device state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg) {
          HIDHandle.deviceInfo.mouseCfg.currentDpi = index;
        }
        
        // Emit update event
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
        this.$bus.$emit("updateCurrentDPI", index);
      } catch (error) {
        console.error('Error updating current DPI on device:', error);
      }
    },
    startEditing(index, force = false) {
      if (index >= this.maxDpiProfiles) return;
      if (!force && index !== this.selectedDpiIndex) return;

      this.editingIndex = index;
      this.$nextTick(() => {
        if (this.$refs.dpiInput && this.$refs.dpiInput[0]) {
          this.$refs.dpiInput[0].focus();
          this.$refs.dpiInput[0].select();
        }
      });
    },
    stopEditing() {
      this.editingIndex = -1;
    },
    async selectMode(value) {
      this.mode = value;
      this.dropdownOpen = false;
      await this.handleDPIEffectChange();
    },
    async handleDPIEffectChange() {
      try {
        if (this.mode === 0) {
          await HIDHandle.Set_MS_DPILightOff();
        } else {
          await HIDHandle.Set_MS_DPILightMode(this.mode);
        }
        
        // Update the device's internal state to match our local state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg && HIDHandle.deviceInfo.mouseCfg.dpiEffect) {
          HIDHandle.deviceInfo.mouseCfg.dpiEffect.mode = this.mode;
          HIDHandle.deviceInfo.mouseCfg.dpiEffect.state = this.mode !== 0;
        }
        
        // Emit the update event to keep other components synchronized
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
      } catch (error) {
        console.error('Error updating DPI light mode:', error);
      }
    },
    handleBrightnessTrackClick(event) {
      if (this.isBrightnessDisabled) return;

      const track = event.currentTarget;
      const rect = track.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      
      // The range is 1-10. There are 9 intervals between 10 points.
      const value = Math.round(percent * 9) + 1;
      
      this.handleBrightnessChange(value);
    },
    async handleBrightnessChange(value) {
      if (this.isBrightnessDisabled) return;
      
      this.brightness = parseInt(value, 10);
      
      try {
        await HIDHandle.Set_MS_DPILightBrightness(this.brightness);
        
        // Update the device's internal state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg && HIDHandle.deviceInfo.mouseCfg.dpiEffect) {
          HIDHandle.deviceInfo.mouseCfg.dpiEffect.brightness = HIDHandle.Index_To_DPILightBrightness(this.brightness);
        }
        
        // Emit the update event
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
      } catch (error) {
        console.error('Error updating DPI light brightness:', error);
      }
    },
    handleSpeedTrackClick(event) {
      if (this.isSpeedDisabled) return;
      
      const track = event.currentTarget;
      const rect = track.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));

      // The range is 1-5. There are 4 intervals between 5 points.
      const value = Math.round(percent * 4) + 1;

      this.handleSpeedChange(value);
    },
    async handleSpeedChange(value) {
      if (this.isSpeedDisabled) return;
      
      this.speed = parseInt(value, 10);
      
      try {
        await HIDHandle.Set_MS_DPILightSpeed(this.speed);
        
        // Update the device's internal state
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg && HIDHandle.deviceInfo.mouseCfg.dpiEffect) {
          HIDHandle.deviceInfo.mouseCfg.dpiEffect.speed = this.speed;
        }
        
        // Emit the update event
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
      } catch (error) {
        console.error('Error updating DPI light speed:', error);
      }
    },
    async updateDpiValue(index, value) {
      let dpiValue = parseInt(value, 10);
      
      if (!isNaN(dpiValue) && dpiValue >= 50 && dpiValue <= 26000) {
        // Round to nearest 50 (like in reference DpiSetting.vue)
        dpiValue = Math.ceil(dpiValue / 50) * 50;
        
        // Clamp to valid range
        if (dpiValue > 26000) dpiValue = 26000;
        if (dpiValue < 50) dpiValue = 50;
        
        // Update local state
        this.dpiProfiles[index].dpi = dpiValue;
        
        // Update device DPI value
        try {
          await HIDHandle.Set_MS_DPIValue(index, dpiValue);
          console.log('✅ DPI value updated on device:', { index, value: dpiValue });
          
          // Update device state
          if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg && HIDHandle.deviceInfo.mouseCfg.dpis[index]) {
            HIDHandle.deviceInfo.mouseCfg.dpis[index].value = dpiValue;
          }
          
          // Emit the change to parent for immediate synchronization
          this.$emit('dpi-value-changed', { index, value: dpiValue });
          
          // Emit update event
          this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
        } catch (error) {
          console.error('Error updating DPI value on device:', error);
        }
      }
    },
    openColorPicker(index) {
      if (index >= this.maxDpiProfiles || index !== this.selectedDpiIndex) return;
      
      this.selectedProfileIndex = index;
      this.selectedProfileColor = this.dpiProfiles[index].color;
      this.colorPickerVisible = true;
    },
    closeColorPicker() {
      this.colorPickerVisible = false;
    },
    async handleColorSelected(color) {
      console.log('🎨 Color selected in DPI Settings Panel:', { index: this.selectedProfileIndex, color });
      
      // Update local state first
      this.$set(this.dpiProfiles[this.selectedProfileIndex], 'color', color);
      // this.colorPickerVisible = false; // Removed to keep picker open
      
      console.log('✅ Local state updated:', this.dpiProfiles[this.selectedProfileIndex]);
      
      // Emit the color change to parent IMMEDIATELY for synchronization
      this.$emit('dpi-color-changed', { index: this.selectedProfileIndex, color });
      console.log('📤 Emitted dpi-color-changed event to parent');
      
      // Convert hex color to RGB format for device communication
      const rgbColor = this.hexToRgb(color);
      console.log('🔄 Converting color for device:', { hex: color, rgb: rgbColor });
      
      // Update device color settings
      try {
        // IMPORTANT: Ensure DPI light is enabled before setting color
        // If DPI light is off, turn it on with current mode
        if (this.mode === 0) {
          console.log('🔆 DPI light is off, enabling it before setting color');
          this.mode = 1; // Set to Steady mode
          await HIDHandle.Set_MS_DPILightMode(1);
          
          // Update device state
          if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg && HIDHandle.deviceInfo.mouseCfg.lightEffect) {
            HIDHandle.deviceInfo.mouseCfg.lightEffect.mode = 1;
            HIDHandle.deviceInfo.mouseCfg.lightEffect.state = true;
          }
        }
        
        // Set the DPI color
        await HIDHandle.Set_MS_DPIColor(this.selectedProfileIndex, rgbColor);
        console.log('✅ DPI color updated on device:', { index: this.selectedProfileIndex, hex: color, rgb: rgbColor });
        
        // Small delay to ensure device processes the color change
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update device state (store in RGB format like reference implementation)
        if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.mouseCfg && HIDHandle.deviceInfo.mouseCfg.dpis[this.selectedProfileIndex]) {
          HIDHandle.deviceInfo.mouseCfg.dpis[this.selectedProfileIndex].color = rgbColor; // Store as RGB
        }
        
        // Emit update event
        this.$bus.$emit("updateMouseUI", HIDHandle.deviceInfo.mouseCfg);
      } catch (error) {
        console.error('Error updating DPI color on device:', error);
        // Even if device update fails, the UI should still update
      }
    },
    hexToRgb(hex) {
      // Convert hex color to rgb(r,g,b) format for device communication
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      return 'rgb(0, 0, 0)'; // Default to black if conversion fails
    },
    rgbToHex(rgb) {
      // Convert rgb(r,g,b) format to hex for UI display
      if (rgb.startsWith('#')) {
        return rgb; // Already hex format
      }
      
      const result = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (result) {
        const r = parseInt(result[1], 10);
        const g = parseInt(result[2], 10);
        const b = parseInt(result[3], 10);
        const toHex = (n) => {
          const hex = n.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
      }
      return '#EF4444'; // Default to red if conversion fails
    },
    resetToDefault() {
      this.dpiProfiles = [
        { dpi: 800, color: '#EF4444' },
        { dpi: 1200, color: '#10B981' },
        { dpi: 1600, color: '#FDE047' },
        { dpi: 1800, color: '#06B6D4' },
        { dpi: 2000, color: '#4F46E5' },
        { dpi: 5000, color: '#EC4899' },
        { dpi: 5400, color: '#64748B' },
        { dpi: 8000, color: '#F59E0B' }
      ];
      this.maxDpiProfiles = 4;
      this.selectedDpiIndex = 0;
      this.editingIndex = -1;
    },
    closeOnClickOutside(event) {
      if (this.$refs.dropdownWrapper && !this.$refs.dropdownWrapper.contains(event.target)) {
        this.dropdownOpen = false;
      }
      if (this.$refs.maxProfilesDropdownWrapper && !this.$refs.maxProfilesDropdownWrapper.contains(event.target)) {
        this.maxProfilesDropdownOpen = false;
      }
      // Close color picker on outside click
      if (this.colorPickerVisible && this.$refs.colorPicker && !this.$refs.colorPicker.$el.contains(event.target)) {
        // Check if the click was on a color swatch, which should not close the picker.
        // We identify swatches by checking if the click target or its parent has the 'profile-color' class.
        const targetIsSwatch = event.target.classList.contains('profile-color') || (event.target.parentElement && event.target.parentElement.classList.contains('profile-color'));
        if (!targetIsSwatch) {
          this.closeColorPicker();
        }
      }
    },
    updateFromDeviceState() {
      if (HIDHandle.deviceInfo && HIDHandle.deviceInfo.deviceOpen) {
        const mouseCfg = HIDHandle.deviceInfo.mouseCfg;
        
        if (mouseCfg) {
          // Update DPI light settings from the correct state property
          const dpiEffect = mouseCfg.dpiEffect;
          if (dpiEffect) {
            this.mode = dpiEffect.state == false ? 0 : dpiEffect.mode;
            this.brightness = HIDHandle.DPILightBrightness_To_Index(dpiEffect.brightness);
            this.speed = dpiEffect.speed;
          }
          
          // Update DPI profiles from device (like in reference DpiSetting.vue)
          if (mouseCfg.dpis) {
            this.dpiProfiles = [];
            for (let i = 0; i < 8; i++) {
              const deviceColor = mouseCfg.dpis[i] ? mouseCfg.dpis[i].color : 'rgb(239, 68, 68)';
              const dpiProfile = {
                dpi: mouseCfg.dpis[i] ? mouseCfg.dpis[i].value : (400 + i * 400),
                color: this.rgbToHex(deviceColor) // Convert RGB to hex for UI
              };
              this.dpiProfiles.push(dpiProfile);
            }
          }
          
          // Update max DPI and current DPI
          if (mouseCfg.maxDpiStage !== undefined) {
            this.maxDpiProfiles = mouseCfg.maxDpiStage;
          }
          
          // No need to set selectedDpiIndex here, it's computed now.
          
          console.log('🔄 DPI Settings updated from device state:', {
            maxDpi: this.maxDpiProfiles,
            currentDpi: this.selectedDpiIndex,
            profiles: this.dpiProfiles.slice(0, this.maxDpiProfiles)
          });
        }
      }
    }
  },
  mounted() {
    // Initialize from device state if connected
    this.updateFromDeviceState();

    // Listen for device updates (like in reference DpiSetting.vue)
    this.$bus.$on("updateMouseUI", mouseCfg => {
      if (mouseCfg) {
        // Update DPI light settings from the correct state property
        if (mouseCfg.dpiEffect) {
          const newMode = mouseCfg.dpiEffect.state == false ? 0 : mouseCfg.dpiEffect.mode;
          const newBrightness = HIDHandle.DPILightBrightness_To_Index(mouseCfg.dpiEffect.brightness);
          const newSpeed = mouseCfg.dpiEffect.speed;
          
          // Only update if the values are actually different to avoid unnecessary re-renders
          if (this.mode !== newMode) {
            this.mode = newMode;
          }
          if (this.brightness !== newBrightness) {
            this.brightness = newBrightness;
          }
          if (this.speed !== newSpeed) {
            this.speed = newSpeed;
          }
        }
        
        // Update DPI profiles from device (like in reference DpiSetting.vue)
        if (mouseCfg.dpis) {
          this.dpiProfiles = [];
          for (let i = 0; i < 8; i++) {
            const deviceColor = mouseCfg.dpis[i] ? mouseCfg.dpis[i].color : 'rgb(239, 68, 68)';
            const dpiProfile = {
              dpi: mouseCfg.dpis[i] ? mouseCfg.dpis[i].value : (400 + i * 400),
              color: this.rgbToHex(deviceColor) // Convert RGB to hex for UI
            };
            this.dpiProfiles.push(dpiProfile);
          }
        }
        
        // Update max DPI and current DPI
        if (mouseCfg.maxDpiStage !== undefined) {
          this.maxDpiProfiles = mouseCfg.maxDpiStage;
        }
        
        // No need to set selectedDpiIndex here, it's computed now.
        
        console.log('🔄 DPI Settings updated via updateMouseUI:', {
          maxDpi: this.maxDpiProfiles,
          currentDpi: this.selectedDpiIndex
        });
      }
    });
    
    // The selectedDpiIndex is now computed, so direct update events are not needed
    // this.$bus.$on("updateCurrentDPI", index => { ... });

    // Also listen for device connection events
    this.$bus.$on("deviceConnect", (connected) => {
      if (connected) {
        // Small delay to ensure device state is fully initialized
        setTimeout(() => {
          this.updateFromDeviceState();
        }, 500);
      }
    });

    // this.$bus.$on('dpiStageChanged', (newIndex) => { ... });

    document.addEventListener('click', this.closeOnClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeOnClickOutside);
    this.$bus.$off("updateMouseUI");
    this.$bus.$off("deviceConnect");
    // this.$bus.$off("updateCurrentDPI");
    // this.$bus.$off('dpiStageChanged');
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
  overflow-x: visible;
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

.dropdown-wrapper {
  position: relative;
  z-index: 1000;
}

.dropdown-container {
  width: 144px;
  padding: 6px 8px;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background: rgba(39, 39, 39, 0.5);
  }
}

.dropdown-value {
  color: #A278FD;
  font-size: 18px;
  font-family: 'DM Sans', sans-serif;
  user-select: none;
}

.dropdown-icon {
  color: #D4D4D8;
  transition: transform 0.2s ease;
  
  &.rotated {
    transform: rotate(180deg);
  }
}

.dropdown-options {
  position: absolute;
  top: 100%;
  right: 0;
  width: 144px;
  background: rgba(39, 39, 42, 0.98);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  margin-top: 4px;
  overflow: hidden;
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-option {
  padding: 10px 16px;
  color: white;
  font-size: 16px;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(162, 120, 253, 0.1);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slider-section {
  margin-bottom: 32px;
  padding: 0 8px;
}

.slider-label {
  display: block;
  color: white;
  font-size: 16px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 24px;
}

.slider-container {
  position: relative;
  width: 100%;
}

.slider-track {
  width: 100%;
  height: 6px;
  background: #27272A;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.slider-fill {
  height: 100%;
  background: #A278FD;
  border-radius: 8px;
  transition: width 0.2s ease;
}

.slider-numbers {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.slider-number {
  color: white;
  font-size: 16px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  opacity: 0.3;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  width: 28px;
  text-align: center;
  
  &.active {
    opacity: 1;
    color: #A278FD;
  }
  
  &:hover {
    opacity: 0.7;
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
  border-radius: 12px;
  background: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  
  &.disabled {
    opacity: 0.3;
    pointer-events: none;
    cursor: not-allowed;
  }
  
  &.selected {
    background: rgba(162, 120, 253, 0.1);
    border: 1px solid #A278FD;
  }
  
  &:hover:not(.disabled) {
    background: rgba(162, 120, 253, 0.05);
  }
  
  .profile-dpi-input {
    background: transparent;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    flex: 1;
    width: 80px;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: left;
    
    &.editing {
      background: rgba(162, 120, 253, 0.2);
      outline: 1px solid #A278FD;
    }
    
    &:focus {
      outline: 1px solid #A278FD;
      background: rgba(162, 120, 253, 0.1);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Hide number input arrows */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    /* Firefox */
    &[type=number] {
      -moz-appearance: textfield;
    }
  }
  
  .profile-dpi-display {
    color: white;
    font-size: 16px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    flex: 1;
    width: 80px;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: left;
    opacity: 0.9;
    
    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
  
  .profile-color {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    margin-right: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    
    &:hover:not(.disabled) {
      transform: scale(1.1);
      border: 2px solid rgba(162, 120, 253, 0.5);
    }
    
    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  
  .profile-edit-btn {
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    padding: 0;
    color: #D4D4D8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      color: #A278FD;
      background: rgba(162, 120, 253, 0.1);
    }
    
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
  margin-top: 24px;
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

.slider-section.disabled {
  opacity: 0.5;
  pointer-events: none;
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