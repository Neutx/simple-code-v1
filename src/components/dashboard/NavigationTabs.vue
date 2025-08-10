<template>
  <div class="navigation-tabs">
    <div 
      v-for="tab in tabs" 
      :key="tab.id"
      class="nav-tab"
      :class="{ active: activeTab === tab.id }"
      @click="setActiveTab(tab.id)"
    >
      <!-- Handle SVG files -->
      <img 
        v-if="!tab.icon.includes(':')" 
        :src="tab.icon" 
        :alt="tab.label"
        class="tab-icon"
      />
      <!-- Handle Iconify icons -->
      <IconifyIcon 
        v-else 
        :icon="tab.icon" 
        class="tab-icon"
      />
      <span class="tab-label">{{ getTabLabel(tab) }}</span>
    </div>
  </div>
</template>
    
<script>
export default {
  name: 'NavigationTabs',
  props: {
    currentPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      activeTab: 'home',
      tabs: [
        {
          id: 'home',
          label: 'Home',
          shortLabel: 'Home',
          icon: 'material-symbols:home-outline-rounded'
        },
        {
          id: 'dpi',
          label: 'DPI Settings',
          shortLabel: 'DPI',
          icon: `${process.env.BASE_URL}icons/DPI.svg`
        },
        {
          id: 'keys',
          label: 'Key Remapping',
          shortLabel: 'Keys',
          icon: 'solar:mouse-outline'
        },
        {
          id: 'sensor',
          label: 'Sensor Settings',
          shortLabel: 'Sensor',
          icon: 'ri:sensor-line'
        },
        // {
        //   id: 'rgb',
        //   label: 'RGB settings',
        //   shortLabel: 'RGB',
        //   icon: 'tabler:color-filter'
        // }
      ]
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    isActive(path) {
      return this.currentPath === path || this.$route.path === path
    },
    navigateToTab(path) {
      // Check if we're already on this route
      if (this.$route.path === path) {
        return // Don't navigate if already on this route
      }
      
      this.$router.push(path).catch(err => {
        // Ignore NavigationDuplicated errors
        if (err.name !== 'NavigationDuplicated') {
          console.error('Navigation error:', err)
        }
      })
    },
    handleResize() {
      this.windowWidth = window.innerWidth
    },
    getTabLabel(tab) {
      if (this.windowWidth <= 1440) {
        return tab.shortLabel
      } else {
        return tab.label
      }
    },
    setActiveTab(id) {
      this.activeTab = id
      this.$emit('tab-changed', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.navigation-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(64, 64, 64, 0.4);
  border-radius: clamp(16px, 1vw, 24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  width: fit-content;
  margin: 0 auto;
  max-width: 90vw;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: clamp(12px, 0.7vw, 18px);
  cursor: pointer;
  transition: all 0.3s ease;
  background: #27272a;
  width: 199px;
  height: 56px;
  justify-content: center;
  
  &.centered {
    justify-content: center;
    gap: 8px;
  }
  
  &:hover {
    background: #3f3f46;
  }
  
  &.active {
    background: #A278FD;
    
    .tab-icon i {
      color: white;
    }
    
    .tab-label {
      color: white;
    }
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: white; /* Ensure Iconify icons are white */
  
  // Style for Iconify icons
  svg {
    font-size: 16px;
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

.tab-label {
  color: white;
  font-size: 16px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}

// Responsive breakpoints - scale proportionally
@media (max-width: 1600px) {
  .navigation-tabs {
    gap: 8px;
    padding: 8px;
  }
  
  .nav-tab {
    gap: 10px;
    padding: 14px 20px;
    width: 180px;
    height: 50px;
  }
  
  .tab-icon {
    width: 22px;
    height: 22px;
    
    i {
      font-size: 15px;
    }
  }
  
  .tab-label {
    font-size: 15px;
  }
}

@media (max-width: 1440px) {
  .navigation-tabs {
    gap: 6px;
    padding: 6px;
  }
  
  .nav-tab {
    gap: 8px;
    padding: 12px 18px;
    width: 160px;
    height: 45px;
  }
  
  .tab-icon {
    width: 20px;
    height: 20px;
    
    i {
      font-size: 14px;
    }
  }
  
  .tab-label {
    font-size: 14px;
  }
}

@media (max-width: 1200px) {
  .navigation-tabs {
    gap: 5px;
    padding: 5px;
  }
  
  .nav-tab {
    gap: 6px;
    padding: 10px 15px;
    width: 140px;
    height: 40px;
  }
  
  .tab-icon {
    width: 18px;
    height: 18px;
    
    i {
      font-size: 13px;
    }
  }
  
  .tab-label {
    font-size: 13px;
  }
}

@media (max-width: 1024px) {
  .navigation-tabs {
    gap: 8px;
    padding: 8px;
    max-width: 95vw;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .nav-tab {
    gap: 8px;
    padding: 12px 16px;
    width: 130px;
    height: 44px;
    flex-shrink: 0;
  }
  
  .tab-icon {
    width: 20px;
    height: 20px;
    
    i {
      font-size: 14px;
    }
  }
  
  .tab-label {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .navigation-tabs {
    gap: 6px;
    padding: 6px;
    max-width: 100vw;
  }
  
  .nav-tab {
    gap: 6px;
    padding: 10px 12px;
    width: 110px;
    height: 40px;
  }
  
  .tab-icon {
    width: 18px;
    height: 18px;
    
    i {
      font-size: 13px;
    }
  }
  
  .tab-label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .navigation-tabs {
    gap: 4px;
    padding: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-tab {
    gap: 8px;
    padding: 12px 16px;
    width: 45%;
    min-width: 120px;
    height: 44px;
    margin-bottom: 4px;
  }
  
  .tab-icon {
    width: 20px;
    height: 20px;
    
    i {
      font-size: 14px;
    }
  }
  
  .tab-label {
    font-size: 12px;
  }
}
</style> 