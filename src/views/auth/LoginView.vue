<template>
  <div class="login-container">
    <!-- Background with Lottie animation -->
    <div class="background-lottie">
      <lottie 
        :options="lottieOptions" 
        :height="windowHeight" 
        :width="windowWidth"
        @animCreated="handleAnimation"
      />
    </div>
    
    <!-- Main content -->
    <div class="login-content">
      <!-- Kreo Logo - 143x44px with 70px top margin -->
      <div class="logo-container">
        <img src="/logos/kreo-logo.svg" alt="Kreo" class="logo" />
      </div>
      
      <!-- Login Card - 471x708px -->
      <div class="login-card">
        <div class="card-header">
          <h1 class="welcome-title">Welcome back</h1>
          <p class="welcome-subtitle">Sign back in to access the application</p>
        </div>
        
        <form @submit.prevent="loginLogic.handleLogin" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper" :class="{ 'error-state': loginLogic.errors.email }">
              <input
                id="email"
                v-model="loginLogic.form.email"
                type="email"
                :placeholder="loginLogic.errors.email || 'you@email.com'"
                :class="{ 'error-input': loginLogic.errors.email }"
                class="form-input"
                @blur="loginLogic.handleEmailValidation"
                @focus="loginLogic.clearEmailError"
              />
            </div>
          </div>
          
          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper" :class="{ 'error-state': loginLogic.errors.password }">
              <input
                id="password"
                v-model="loginLogic.form.password"
                type="password"
                :placeholder="loginLogic.errors.password || ''"
                :class="{ 'error-input': loginLogic.errors.password }"
                class="form-input"
                @blur="loginLogic.handlePasswordValidation"
                @focus="loginLogic.clearPasswordError"
              />
            </div>
          </div>
          
          <!-- Remember Me & Forgot Password -->
          <div class="form-options">
            <div class="remember-me">
              <div class="checkbox-wrapper">
                <input
                  id="remember"
                  v-model="loginLogic.form.rememberMe"
                  type="checkbox"
                  class="custom-checkbox"
                />
                <div class="checkbox-visual"></div>
              </div>
              <label for="remember" class="remember-label">Remember me</label>
            </div>
            <router-link to="/forgot-password" class="forgot-link">
              Forgot password?
            </router-link>
          </div>
          
          <!-- Login Button -->
          <button
            type="submit"
            :disabled="!loginLogic.isFormValid() || loading"
            class="login-button"
          >
            {{ loading ? 'Signing in...' : 'Login' }}
          </button>
          
          <!-- Register Link -->
          <div class="register-link">
            <span class="register-text">Don't have an account? </span>
            <router-link to="/register" class="register-bold">Register</router-link>
          </div>
          
          <!-- Google Sign In -->
          <button
            type="button"
            :disabled="loginLogic.googleLoading()"
            @click="loginLogic.handleGoogleLogin"
            class="google-button"
          >
            <div class="google-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <span>Sign in with Google</span>
          </button>
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
import Lottie from 'vue-lottie/src/lottie.vue'
import animationData from '@/../public/img/home-bg.json'


export default {
  name: 'LoginView',
  components: {
    Lottie
  },
  data() {
    return {
      loginLogic: null,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      lottieOptions: {
        animationData: animationData,
        autoplay: true,
        loop: true,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  created() {
    // Initialize login logic
    this.loginLogic = createLoginComposable(this.$store, this.$router, this.$message)
    this.loginLogic.initializeRememberMe()
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleAnimation(anim) {
      this.anim = anim
    },
    handleResize() {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/auth/login.scss';
</style> 