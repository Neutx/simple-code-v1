<template>
  <div class="initialize-container">
    <!-- Main content -->
    <div class="main-content">
      <!-- Top right controls (hidden initially) -->
      <div class="top-controls">
        <div class="control-button">
          <div class="control-icon">
            <!-- Battery icon placeholder -->
          </div>
        </div>
        <div class="control-button">
          <div class="control-icon">
            <!-- Settings icon placeholder -->
          </div>
        </div>
        <div class="control-button">
          <div class="control-icon">
            <!-- Menu icon placeholder -->
          </div>
        </div>
      </div>
      
      <!-- Main title with logo -->
      <div class="title-section">
        <h1 class="main-title">
          Welcome to <span class="kreo-logo-wrapper"><img src="/img/kreo_logo_purple.svg" alt="kreo" class="kreo-logo" /></span> hub
        </h1>
      </div>

      <!-- Subtitle -->
      <div class="subtitle-section">
        <p class="subtitle">Your personal command center</p>
      </div>
      
      <!-- Action buttons -->
      <div class="action-buttons">
        <button 
          class="action-button"
          @click="initializeLogic.handleConnect"
          :disabled="initializeLogic.connecting()"
        >
          {{ initializeLogic.connecting() ? 'Connecting...' : 'Connect' }}
        </button>
        <button 
          class="action-button"
          @click="initializeLogic.handlePair"
          :disabled="initializeLogic.pairing()"
        >
          {{ initializeLogic.pairing() ? 'Pairing...' : 'Pair' }}
        </button>
      </div>
      
      <!-- Browser support info -->
      <div class="browser-support">
        <p class="browser-text">Currently supports Google Chrome, MS Edge and Opera</p>
      </div>

      <!-- Error notification -->
      <div class="error-notification" :class="{ 'show': initializeLogic.showError() }">
        <div class="error-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="white"/>
          </svg>
        </div>
        <div class="error-content">
          <div class="error-title">Connection error</div>
          <div class="error-description">The device you tried to connect, is not supported by us currently. Please retry with a different device</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createInitializeComposable } from '@/scripts/device/initialize'
import HIDHandle from '@/assets/js/HIDHandle'

export default {
  name: 'InitializeView',
  data() {
    return {
      initializeLogic: null,
      deviceInfo: HIDHandle.deviceInfo,
      loggingInterval: null,
      sensorModeOptions: [],
      lodOptions: [],
      sensorMode: null,
      lod: null,
      performanceState: null,
      performance: null,
      ripple: null,
      angle: null,
      motionSync: null,
      isWired: false
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected'])
  },
  created() {
    this.initializeLogic = createInitializeComposable(this.$store, this.$router, this.$message)
  },
  
  mounted() {
    // Initialize WebHID support check
    
    // Set up real-time device monitoring as per .cursorrules
    this.setupDeviceLogging()
    
    // Listen for device connection events
    this.$bus.$on("deviceConnect", (connected) => {
      if (connected) {
        this.startRealTimeLogging()
      }
    });

    // Listen for UI updates
    this.$bus.$on("updateMouseUI", () => {
      // Handle mouse config updates
    });
    
    if (this.isConnected) {
      this.$router.replace('/dashboard/home')
    }
  },
  
  beforeDestroy() {
    // Clean up intervals and event listeners
    if (this.loggingInterval) {
      clearInterval(this.loggingInterval)
    }
    this.$bus.$off("deviceConnect")
    this.$bus.$off("updateMouseUI")
  },
  
  watch: {
    // Monitor all device changes as specified in .cursorrules
    "deviceInfo": {
      handler(newInfo) {
        // Start real-time logging when device becomes connected
        if (newInfo.connectState === 2 && newInfo.deviceOpen) {
          this.startRealTimeLogging()
        }
      },
      deep: true
    },
    
    // Watch for device connection changes from store
    isConnected(newVal) {
      if (newVal) {
        this.startRealTimeLogging()
      }
    }
  },
  
  methods: {
    setupDeviceLogging() {
      // Initial device state logging setup
    },
    
    startRealTimeLogging() {
      // Clear any existing interval
      if (this.loggingInterval) {
        clearInterval(this.loggingInterval)
      }
      
      // Set up comprehensive logging every second as per .cursorrules
      this.loggingInterval = setInterval(() => {
        if (HIDHandle.deviceInfo.deviceOpen) {
          // Monitor device status without logging
        }
      }, 1000);
    },
    testAllSleepTimers() {
      // Implementation of testAllSleepTimers method
    },
    syncSensorFromDevice() {
      // Implementation of syncSensorFromDevice method
    },
    setCorderMode() {
      // Implementation of setCorderMode method
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/pages/initialize.scss';
</style> 