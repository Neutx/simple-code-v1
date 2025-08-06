<template>
  <div class="os-detector-container">
    <div class="os-icon">
      <svg v-if="os === 'windows'" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M0 0h6v6H0V0zm7 0h7v6H7V0zM0 7h6v7H0V7zm7 0h7v7H7V7z" fill="currentColor"/>
      </svg>
      <svg v-else-if="os === 'macos'" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M12.5 1.5c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5V2c0-.3-.2-.5-.5-.5h-1zM1.5 1.5c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5V2c0-.3-.2-.5-.5-.5h-1z" fill="currentColor"/>
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L1 4v6l6 3 6-3V4L7 1zM2 5l5-2.5L12 5v4l-5 2.5L2 9V5z" fill="currentColor"/>
      </svg>
    </div>
    <span class="os-text">{{ osName }}</span>
  </div>
</template>

<script>
export default {
  name: 'OSDetector',
  data() {
    return {
      os: 'unknown',
      osName: 'Unknown'
    }
  },
  mounted() {
    this.detectOS()
  },
  methods: {
    detectOS() {
      // Modern way to detect OS
      if (navigator.userAgentData && navigator.userAgentData.platform) {
        const platform = navigator.userAgentData.platform.toLowerCase()
        if (platform.includes('windows')) {
          this.os = 'windows'
          this.osName = 'Windows'
        } else if (platform.includes('mac')) {
          this.os = 'macos'
          this.osName = 'macOS'
        } else if (platform.includes('linux')) {
          this.os = 'linux'
          this.osName = 'Linux'
        }
      } else {
        // Fallback for older browsers
        const userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.includes('win')) {
          this.os = 'windows'
          this.osName = 'Windows'
        } else if (userAgent.includes('mac')) {
          this.os = 'macos'
          this.osName = 'macOS'
        } else if (userAgent.includes('linux')) {
          this.os = 'linux'
          this.osName = 'Linux'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.os-detector-container {
  position: fixed;
  bottom: 2vh;
  right: 12vh;
  padding: 0.8vh 1.6vh;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.6vh;
  backdrop-filter: blur(1vh);
  z-index: 1000;
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8vh;
  /* Fixed size regardless of zoom */
  transform: scale(1);
  transform-origin: bottom right;
  
  .os-icon {
    width: 1.4vh;
    height: 1.4vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .os-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.4vh;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
}
</style> 