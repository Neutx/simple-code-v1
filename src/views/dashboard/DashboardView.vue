<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <!-- Back button -->
      <el-button 
        @click="navigationLogic.goBack" 
        type="text" 
        class="back-button"
        icon="el-icon-arrow-left"
      >
      </el-button>
      
      <!-- Kreo Logo -->
      <div class="logo-container">
        <img src="/logos/kreo-logo.svg" alt="Kreo" class="logo" />
      </div>
      
      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <router-link 
          v-for="tab in navigationLogic.navigationTabs" 
          :key="tab.name"
          :to="tab.path"
          class="nav-tab"
          :class="{ 'active': $route.name === tab.name }"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </router-link>
      </nav>
      
      <!-- User Actions -->
      <div class="user-actions">
        <el-button 
          @click="userMenuLogic.toggleUserMenu"
          type="text" 
          class="user-button"
          icon="el-icon-user"
        >
        </el-button>
        
        <!-- User Menu Dropdown -->
        <div v-if="userMenuLogic.showUserMenu()" class="user-menu glass-effect">
          <div class="user-info">
            <div class="user-avatar">
              <i class="el-icon-user"></i>
            </div>
            <div class="user-details">
              <p class="user-name">{{ currentUser ? currentUser.displayName : 'User' }}</p>
              <p class="user-email">{{ currentUser ? currentUser.email : '' }}</p>
            </div>
          </div>
          <div class="menu-divider"></div>
          <el-button @click="userMenuLogic.handleLogout" type="text" class="logout-button">
            <i class="el-icon-switch-button"></i>
            Logout
          </el-button>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="dashboard-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createNavigationComposable } from '@/scripts/dashboard/navigation'
import { createUserMenuComposable } from '@/scripts/dashboard/user-menu'

export default {
  name: 'DashboardView',
  data() {
    return {
      navigationLogic: null,
      userMenuLogic: null,
      cleanupOutsideClick: null
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('device', ['isConnected', 'deviceInfo'])
  },
  created() {
    // Initialize logic modules
    this.navigationLogic = createNavigationComposable(this.$router)
    this.userMenuLogic = createUserMenuComposable(this.$store, this.$router, this.$message)
  },
  
  mounted() {
    // Setup outside click listener for user menu
    this.cleanupOutsideClick = this.userMenuLogic.setupOutsideClickListener(this.$el)
    
    // Redirect to initialize if not connected
    if (!this.isConnected) {
      this.$router.push('/initialize')
    }
  },
  
  beforeDestroy() {
    // Cleanup event listeners
    if (this.cleanupOutsideClick) {
      this.cleanupOutsideClick()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/dashboard/dashboard.scss';
</style> 