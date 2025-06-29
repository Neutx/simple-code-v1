<template>
  <div class="sensor-mouse-display">
    <!-- Glow background -->
    <div class="mouse-glow"></div>

    <!-- Mouse image -->
    <img
      :src="mouseImageSrc"
      :alt="deviceModel + ' Mouse'"
      class="mouse-img"
      @error="handleError"
    />

    <!-- Profiles list -->
    <div class="profiles-wrapper" :class="{ expanded: profilesExpanded }">
      <!-- Active profile (always visible) -->
      <div
        class="profile-item active"
        @click="toggleProfiles"
      >
        <span>Profile {{ activeProfile }}</span>
        <div class="expand-icon" :class="{ rotated: profilesExpanded }">
          <IconifyIcon icon="mdi:chevron-down" />
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

    <!-- Status Bar below mouse display -->
    <div class="sensor-status-bar">
      <div class="inline-flex justify-start items-center gap-20">
        <div class="flex justify-start items-end gap-2.5">
          <div class="status-icon">
            <IconifyIcon icon="solar:mouse-outline" />
          </div>
          <div class="w-28 h-6 justify-center">
            <span class="text-white/50 text-lg font-semibold font-['DM_Sans']">Model:</span>
            <span class="text-white text-lg font-semibold font-['DM_Sans']"> {{ deviceModel }}</span>
          </div>
        </div>
        <div class="flex justify-start items-start gap-2.5">
          <div class="status-icon">
            <img src="/icons/dpi.svg" alt="DPI" />
          </div>
          <div class="w-16 h-6 justify-center">
            <span class="text-white/50 text-lg font-semibold font-['DM_Sans']">DPI:</span>
            <span class="text-white text-lg font-semibold font-['DM_Sans']"> {{ currentDPI }}</span>
          </div>
        </div>
        <div class="flex justify-start items-end gap-2.5">
          <div class="status-icon">
            <IconifyIcon icon="material-symbols:speed-outline-rounded" />
          </div>
          <div class="w-44 h-6 justify-center">
            <span class="text-white/50 text-lg font-semibold font-['DM_Sans']">Polling rate:</span>
            <span class="text-white text-lg font-semibold font-['DM_Sans']"> {{ pollingRate }}Hz</span>
          </div>
        </div>
        <div class="flex justify-start items-end gap-2.5">
          <div class="status-icon">
            <IconifyIcon icon="mdi:battery-outline" />
          </div>
          <div class="w-28 h-6 justify-center">
            <span class="text-white/50 text-lg font-semibold font-['DM_Sans']">Battery:</span>
            <span class="text-white text-lg font-semibold font-['DM_Sans']"> {{ batteryLevel }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SensorMouseDisplay',
  props: {
    deviceModel: {
      type: String,
      default: 'Ikarus'
    },
    mouseImageSrc: {
      type: String,
      default: '/mice/ikarus.svg'
    },
    profileCount: {
      type: Number,
      default: 4
    },
    activeProfile: {
      type: Number,
      default: 1
    },
    currentDPI: {
      type: [String, Number],
      default: '420'
    },
    pollingRate: {
      type: [String, Number],
      default: '4000'
    },
    batteryLevel: {
      type: [String, Number],
      default: '69'
    }
  },
  data() {
    return {
      profilesExpanded: false
    }
  },
  methods: {
    handleError(evt) {
      evt.target.src = '/mice/ikarus.svg'
    },
    toggleProfiles() {
      this.profilesExpanded = !this.profilesExpanded
    },
    selectProfile(index) {
      this.$emit('profile-selected', index)
      this.profilesExpanded = false // Collapse after selection
    }
  }
}
</script>

<style lang="scss" scoped>
.sensor-mouse-display {
  position: relative;
  width: clamp(320px, 47vw, 904px);
  height: clamp(400px, 56vh, 609px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* prevent sensor card overlap clicks */
}

.mouse-glow {
  position: absolute;
  width: 40%;
  height: 50%;
  background: #8b5cf6;
  border-radius: 50%;
  filter: blur(120px);
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.mouse-img {
  position: relative;
  width: 124px; /* Matches provided placeholder */
  height: 205px;
  object-fit: contain;
  z-index: 2;
}

.profiles-wrapper {
  position: absolute;
  width: 144px;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 3;
  pointer-events: auto;
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
  border-radius: 19px;
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

.sensor-status-bar {
  position: absolute;
  bottom: -140px;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  z-index: 3;
  pointer-events: auto;
  white-space: nowrap;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  min-width: 20px;
  min-height: 20px;
  max-width: 28px;
  max-height: 28px;
  position: relative;
  flex-shrink: 0;
  
  // Style for Iconify icons
  svg {
    font-size: 1.125rem;
    color: white;
    width: 100%;
    height: 100%;
  }
  
  // Style for SVG images
  img {
    width: 100%;
    height: 100%;
    filter: brightness(0) invert(1); // Make SVG white
  }
}

/* Tailwind-like utility classes for the status bar */
.inline-flex {
  display: inline-flex;
}

.justify-start {
  justify-content: flex-start;
}

.items-center {
  align-items: center;
}

.items-end {
  align-items: flex-end;
}

.items-start {
  align-items: flex-start;
}

.gap-20 {
  gap: 1.25rem;
}

.gap-2\.5 {
  gap: 0.625rem;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
  display: flex;
  align-items: center;
}

.w-28 {
  width: 7rem;
}

.w-16 {
  width: 4rem;
}

.w-44 {
  width: 11rem;
}

.h-6 {
  height: 1.5rem;
}

.text-white\/50 {
  color: rgb(255 255 255 / 0.5);
}

.text-white {
  color: rgb(255 255 255);
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.font-\[\'DM_Sans\'\] {
  font-family: 'DM Sans', sans-serif;
}
</style> 