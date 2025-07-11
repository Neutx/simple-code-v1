<template>
  <div class="create-macro-overlay">
    <div class="create-macro-container">
      <!-- Header with navigation -->
      <div class="header">
        <button class="nav-btn back" @click="goBack">
          <IconifyIcon icon="mdi:chevron-left" />
        </button>
        <div class="titles">
          <h2 class="macro-name">{{ macroName }}</h2>
          <h3 class="screen-title">{{ currentScreenTitle }}</h3>
        </div>
        <button class="nav-btn close" @click="$emit('close')">
          <IconifyIcon icon="mdi:close" />
        </button>
      </div>
      
      <!-- Macro Type Selection -->
      <div class="type-selection" :class="{ 'compact': selectedType }">
        <div
          v-for="macroType in macroTypes"
          :key="macroType.id"
          class="type-button-wrapper"
          @click="selectType(macroType.id)"
        >
          <button class="type-button" :class="{ 'active': selectedType === macroType.id }">
            <IconifyIcon :icon="macroType.icon" />
          </button>
          <span class="tooltip" v-if="!selectedType">{{ macroType.label }}</span>
        </div>
      </div>

      <!-- Cycle Input UI for Toggle-->
      <div class="cycle-input-section" v-if="selectedType === 'toggle' && !showRecordingUI">
        <div class="input-wrapper">
          <input type="number" v-model="cycleCount" placeholder="Number of clicks" class="cycle-input"/>
        </div>
        <button class="continue-btn" @click="proceedToRecording">Continue</button>
      </div>

      <!-- Recording UI -->
      <div class="recording-ui" v-if="showRecordingUI">
        <h4 v-if="selectedMacroLabel" class="selected-macro-label">{{ selectedMacroLabel }}</h4>
        <div class="recorded-actions-list" v-if="recordedActions.length > 0">
            <div v-for="(action, index) in recordedActions" :key="index" class="action-item">
                {{ action.key }}{{ action.type === '↓' ? '↓' : '↑' }}{{ action.delay }}ms
            </div>
        </div>
        <button class="record-btn" :class="{ 'recording': isRecording }" @click="toggleRecording">
            <div class="record-icon">
                <div v-if="!isRecording" class="record-icon-default">
                    <div class="ring"></div>
                    <div class="dot"></div>
                </div>
                <div v-if="isRecording" class="record-icon-stop"></div>
            </div>
            <span>{{ isRecording ? 'Stop' : 'Record' }}</span>
        </button>
        <button class="save-btn" :disabled="recordedActions.length === 0 || isRecording" @click="saveMacro">
            Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateMacroView',
  props: {
    macroName: {
      type: String,
      required: true
    }
  },  data() {
    return {
      selectedType: null,
      showRecordingUI: false,
      cycleCount: 3,
      isRecording: false,
      recordedActions: [],
      macroTypes: [
        { id: 'repeat', label: 'Cycle until button is released', icon: 'entypo:cycle' },
        { id: 'no-repeat', label: 'Cycle until any button is pressed', icon: 'tabler:click' },
        { id: 'on-press', label: 'Cycle until specific button is pressed', icon: 'icon-park-outline:click-tap-two' },
        { id: 'toggle', label: 'Cycle multiple times', icon: 'mdi:toggle-switch' }
      ]
    }
  },
  computed: {
    currentScreenTitle() {
      if (this.showRecordingUI) return 'Start recording';
      return 'Select type of macro';
    },
    selectedMacroLabel() {
      if (!this.selectedType) return '';
      const macro = this.macroTypes.find(m => m.id === this.selectedType);
      return macro ? macro.label : '';
    }
  },
  methods: {
    selectType(typeId) {
      this.selectedType = typeId;
      this.recordedActions = [];
      this.isRecording = false;
      if (typeId !== 'toggle') {
        this.showRecordingUI = true;
      } else {
        this.showRecordingUI = false;
      }
    },
    proceedToRecording() {
      this.showRecordingUI = true;
    },
    goBack() {
      if (this.showRecordingUI) {
        this.showRecordingUI = false;
        this.isRecording = false;
        if (this.selectedType !== 'toggle') {
            this.selectedType = null;
        }
      } else if (this.selectedType === 'toggle') {
        this.selectedType = null;
      } else {
        this.$emit('back');
      }
    },
    toggleRecording() {
        this.isRecording = !this.isRecording;
        if (this.isRecording) {
            // Simulate recording
            this.recordedActions = [
                { key: 'Ctrl', type: '↓', delay: 50 },
                { key: 'C', type: '↓', delay: 50 },
                { key: 'C', type: '↑', delay: 50 },
                { key: 'Ctrl', type: '↑', delay: 50 },
            ];
        }
    },
    saveMacro() {
        this.$emit('save-macro', {
            name: this.macroName,
            type: this.selectedType,
            actions: this.recordedActions,
            cycleCount: this.selectedType === 'toggle' ? this.cycleCount : null
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.create-macro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
  color: white;
  font-family: 'DM Sans', sans-serif;
}

.create-macro-container {
  width: 720px;
  padding: 40px;
  background: rgba(39, 39, 42, 0.9);
  border-radius: 24px;
  backdrop-filter: blur(54px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60px;
  position: relative;

  .titles {
    text-align: center;
  }

  .macro-name {
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px 0;
  }

  .screen-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    background: rgba(64, 64, 64, 0.8);
    border-radius: 14px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    font-size: 28px;
    color: white;

    &.back {
      left: 0;
    }

    &.close {
      right: 0;
    }

    &:hover {
      background: rgba(80, 80, 80, 0.8);
    }
  }
}

.type-selection {
  display: flex;
  gap: 40px;

  &.compact {
    flex-wrap: wrap;
  }
}

.type-button-wrapper {
  position: relative;

  .tooltip {
    visibility: hidden;
    width: 160px;
    background-color: #18181B;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px 0;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -80px;
    opacity: 0;
    transition: opacity 0.3s;

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #18181B transparent transparent transparent;
    }
  }

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
}

.type-button {
  width: 96px;
  height: 96px;
  background: #27272A;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 32px;
  color: white;

  &:hover {
    background: #3f3f46;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }

  &.active {
    background: #3f3f46;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }

  .iconify {
    width: 32px;
    height: 32px;
  }
}

.cycle-input-section {
  margin-top: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  .input-wrapper {
    width: 384px; // w-96
    height: 80px; // h-20
    position: relative;

    .cycle-input {
      width: 100%;
      height: 100%;
      background-color: #27272a; // bg-zinc-800
      border-radius: 20px;
      border: 2px solid #a855f7; // border-purple-500
      color: white;
      font-size: 20px; // text-xl
      padding: 0 24px;
      text-align: center;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      
      // Hide spin buttons for number input
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      -moz-appearance: textfield;
    }
  }

  .continue-btn {
    width: 192px; // w-48
    height: 64px; // h-16
    background-color: #a855f7; // bg-violet-400
    border-radius: 16px; // rounded-2xl
    border: none;
    color: white;
    font-size: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #9333ea;
    }
  }
}

.recording-ui {
  margin-top: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .selected-macro-label {
    color: #e5e7eb;
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 24px;
    text-align: center;
  }

  .recorded-actions-list {
    width: 100%;
    max-width: 350px;
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 24px;
    
    .action-item {
      color: #e5e7eb;
      font-size: 1rem;
      font-weight: 500;
      text-align: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .record-btn {
    width: 288px;
    height: 64px;
    background-color: transparent;
    border-radius: 16px;
    outline: 2px solid #a78bfa;
    outline-offset: -2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 20px;
    font-weight: 500;
    color: white;
    padding: 0;

    .record-icon {
        width: 24px;
        height: 24px;
        margin-right: 16px;
        position: relative;

        .record-icon-default {
            .ring {
                position: absolute;
                width: 20.83px;
                height: 20.83px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 1.5px solid #a78bfa;
                border-radius: 50%;
            }
            .dot {
                position: absolute;
                width: 10.42px;
                height: 10.42px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #a78bfa;
                border-radius: 50%;
            }
        }
        .record-icon-stop {
            position: absolute;
            width: 12px;
            height: 12px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #ef4444;
        }
    }

    &.recording {
        outline-color: #ef4444;
    }
  }

  .save-btn {
    width: 288px;
    height: 64px;
    background: #a78bfa;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 20px;
    font-weight: 500;
    color: white;

    &:disabled {
      background: #a78bfa;
      opacity: 0.2;
      cursor: not-allowed;
    }
  }
}
</style> 