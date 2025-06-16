<template>
  <div class="login-container">
    <!-- Background with gradient -->
    <div class="background-gradient"></div>
    
    <!-- Main content -->
    <div class="login-content">
      <!-- Kreo Logo -->
      <div class="logo-container">
        <img src="/logos/kreo-navbar.svg" alt="Kreo" class="logo" />
      </div>
      
      <!-- Login Card -->
      <div class="login-card glass-effect">
        <div class="card-header">
          <h1 class="welcome-title">Welcome back</h1>
          <p class="welcome-subtitle">Sign back in to access the application</p>
        </div>
        
        <form @submit.prevent="loginLogic.handleLogin" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <el-input
              id="email"
              v-model="loginLogic.form.email"
              type="email"
              placeholder="you@email.com"
              size="large"
              :class="{ 'error': loginLogic.errors.email }"
              @blur="loginLogic.handleEmailValidation"
            />
            <span v-if="loginLogic.errors.email" class="error-text">{{ loginLogic.errors.email }}</span>
          </div>
          
          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <el-input
              id="password"
              v-model="loginLogic.form.password"
              type="password"
              placeholder="••••••••"
              size="large"
              show-password
              :class="{ 'error': loginLogic.errors.password }"
              @blur="loginLogic.handlePasswordValidation"
            />
            <span v-if="loginLogic.errors.password" class="error-text">{{ loginLogic.errors.password }}</span>
          </div>
          
          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <el-checkbox v-model="loginLogic.form.rememberMe" class="remember-checkbox">
              Remember me
            </el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">
              Forgot password?
            </router-link>
          </div>
          
          <!-- Login Button -->
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!loginLogic.isFormValid()"
            class="login-button gradient-bg"
            native-type="submit"
          >
            {{ loading ? 'Signing in...' : 'Login' }}
          </el-button>
          
          <!-- Register Link -->
          <div class="register-link">
            <span>Don't have an account? </span>
            <router-link to="/register" class="register-text">Register</router-link>
          </div>
          
          <!-- Divider -->
          <div class="divider">
            <span class="divider-text">or</span>
          </div>
          
          <!-- Google Sign In -->
          <el-button
            size="large"
            :loading="loginLogic.googleLoading()"
            @click="loginLogic.handleGoogleLogin"
            class="google-button"
          >
            Sign in with Google
          </el-button>
        </form>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <router-link to="/privacy" class="footer-link">Privacy policy</router-link>
        <router-link to="/terms" class="footer-link">Terms and conditions</router-link>
        <span class="copyright">© 2025 Kreo</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createLoginComposable } from '@/scripts/auth/login'

export default {
  name: 'LoginView',
  data() {
    return {
      loginLogic: null
    }
  },
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  created() {
    // Initialize login logic
    this.loginLogic = createLoginComposable(this.$store, this.$router, this.$message)
    this.loginLogic.initializeRememberMe()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/auth/login.scss';
</style> 