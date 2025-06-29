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
      loggingInterval: null
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
    console.log("🔧 WebHID Support:", 'hid' in navigator);
    console.log("🔧 Device Info:", HIDHandle.deviceInfo);
    console.log("🔧 Connection State:", HIDHandle.deviceInfo.connectState);
    
    // Set up real-time device monitoring as per .cursorrules
    this.setupDeviceLogging()
    
    // Listen for device connection events
    this.$bus.$on("deviceConnect", (connected) => {
      if (connected) {
        console.log("✅ Device connected - Real-time monitoring active");
        this.startRealTimeLogging()
      }
    });

    // Listen for UI updates
    this.$bus.$on("updateMouseUI", (mouseCfg) => {
      console.log("🎮 Mouse settings updated:", mouseCfg);
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
        console.log("🔄 Device Update:", {
          connected: newInfo.connectState === 2,
          battery: newInfo.battery.level + "%",
          dpi: newInfo.mouseCfg.dpis[newInfo.mouseCfg.currentDpi]?.value,
          reportRate: newInfo.mouseCfg.reportRate + "Hz",
          timestamp: new Date().toISOString()
        });
        
        // Start real-time logging when device becomes connected
        if (newInfo.connectState === 2 && newInfo.deviceOpen) {
          console.log("✅ Device connected - Starting real-time monitoring");
          this.startRealTimeLogging()
        }
      },
      deep: true
    },
    
    // Watch for device connection changes from store
    isConnected(newVal) {
      if (newVal) {
        console.log("✅ Device connected via store - Real-time monitoring active");
        this.startRealTimeLogging()
      }
    }
  },
  
  methods: {
    setupDeviceLogging() {
      // Initial device state logging
      console.log("🚀 Initialize Page - Device Logger Started");
      console.log("📱 Initial Device State:", {
        deviceOpen: HIDHandle.deviceInfo.deviceOpen,
        connectState: HIDHandle.deviceInfo.connectState,
        online: HIDHandle.deviceInfo.online,
        timestamp: new Date().toISOString()
      });
      
      // Log initial HIDHandle state for debugging
      console.log("🔧 HIDHandle Initial State:", {
        deviceInfo: HIDHandle.deviceInfo,
        connectState: HIDHandle.deviceInfo.connectState,
        battery: HIDHandle.deviceInfo.battery,
        mouseCfg: HIDHandle.deviceInfo.mouseCfg,
        timestamp: new Date().toISOString()
      });
      
      // Log WebHID API availability
      console.log("🌐 WebHID API Check:", {
        supported: 'hid' in navigator,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    },
    
    startRealTimeLogging() {
      // Clear any existing interval
      if (this.loggingInterval) {
        clearInterval(this.loggingInterval)
      }
      
      // Set up comprehensive logging every second as per .cursorrules
      this.loggingInterval = setInterval(() => {
        if (HIDHandle.deviceInfo.deviceOpen) {
          const status = {
            timestamp: new Date().toISOString(),
            model: "Ikarus", // From your status bar
            dpi: HIDHandle.deviceInfo.mouseCfg.dpis[HIDHandle.deviceInfo.mouseCfg.currentDpi]?.value || 1600,
            pollingRate: HIDHandle.deviceInfo.mouseCfg.reportRate + "Hz",
            battery: HIDHandle.deviceInfo.battery.level + "%",
            lod: HIDHandle.deviceInfo.mouseCfg.sensor.lod + "MM",
            motionSync: HIDHandle.deviceInfo.mouseCfg.sensor.motionSync ? "ON" : "OFF",
            online: HIDHandle.deviceInfo.online ? "CONNECTED" : "OFFLINE",
            connectState: HIDHandle.deviceInfo.connectState,
            deviceInfo: {
              cid: HIDHandle.deviceInfo.info.cid,
              mid: HIDHandle.deviceInfo.info.mid,
              type: HIDHandle.deviceInfo.info.type
            },
            isWired: HIDHandle.deviceInfo.isWired,
            maxReportRate: HIDHandle.deviceInfo.maxReportRate
          };
          
          console.log("📊 REAL-TIME STATUS:", status);
          
          // Additional detailed logging for battery
          if (HIDHandle.deviceInfo.battery) {
            console.log("🔋 Battery Details:", {
              level: HIDHandle.deviceInfo.battery.level,
              charging: HIDHandle.deviceInfo.battery.charging,
              voltage: HIDHandle.deviceInfo.battery.voltage,
              timestamp: new Date().toISOString()
            });
          }
          
          // Additional detailed logging for mouse configuration
          if (HIDHandle.deviceInfo.mouseCfg) {
            console.log("🖱️ Mouse Config:", {
              currentDpi: HIDHandle.deviceInfo.mouseCfg.currentDpi,
              maxDpiStage: HIDHandle.deviceInfo.mouseCfg.maxDpiStage,
              dpis: HIDHandle.deviceInfo.mouseCfg.dpis,
              sensor: HIDHandle.deviceInfo.mouseCfg.sensor,
              lightEffect: HIDHandle.deviceInfo.mouseCfg.lightEffect,
              keysCount: HIDHandle.deviceInfo.mouseCfg.keysCount,
              timestamp: new Date().toISOString()
            });
          }
        }
      }, 1000);
      
      console.log("🔄 Real-time logging started - Updates every 1 second");
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/pages/initialize.scss';
</style> 