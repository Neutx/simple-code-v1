<template>
  <div class="navigation-tabs">
    <div 
      v-for="tab in tabs" 
      :key="tab.name"
      :class="['nav-tab', { 'active': isActive(tab.path) }]"
      @click="navigateToTab(tab.path)"
    >
      <div class="tab-icon">
        <i :class="tab.icon"></i>
      </div>
      <span class="tab-label">{{ tab.label }}</span>
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
      tabs: [
        {
          name: 'Home',
          path: '/dashboard/home',
          label: 'Home',
          icon: 'el-icon-house'
        },
        {
          name: 'DPI',
          path: '/dashboard/dpi',
          label: 'DPI settings',
          icon: 'el-icon-aim'
        },
        {
          name: 'Keys',
          path: '/dashboard/keys',
          label: 'Key remapping',
          icon: 'el-icon-keyboard'
        },
        {
          name: 'Sensor',
          path: '/dashboard/sensor',
          label: 'Sensor settings',
          icon: 'el-icon-cpu'
        },
        {
          name: 'RGB',
          path: '/dashboard/rgb',
          label: 'RGB settings',
          icon: 'el-icon-magic-stick'
        }
      ]
    }
  },
  methods: {
    isActive(path) {
      return this.currentPath === path || this.$route.path === path
    },
    navigateToTab(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
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
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  width: fit-content;
  margin: 0 auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #27272a;
  width: 199px;
  height: 56px;
  
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
  
  i {
    font-size: 16px;
    color: white;
  }
}

.tab-label {
  color: white;
  font-size: 16px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}
</style> 