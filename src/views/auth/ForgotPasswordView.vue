<template>
  <div class="forgot-password-container">
    <!-- 16:9 Aspect Ratio Container -->
    <div class="aspect-ratio-container">
      <!-- Main content -->
      <div class="forgot-password-content">
      <!-- Kreo Logo -->
      <div class="logo-container">
        <img src="/logos/kreo-logo.svg" alt="Kreo" class="logo" />
      </div>
      
      <!-- Forgot Password Card -->
      <div class="forgot-password-card">
        <div class="card-header">
          <h1 class="title">Reset Password</h1>
          <p class="subtitle">Enter your email to receive a password reset link</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="forgot-password-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper" :class="{ 'error-state': error }">
              <input
                id="email"
                v-model="email"
                type="email"
                :placeholder="error || 'you@email.com'"
                :class="{ 'error-input': error }"
                class="form-input"
                @blur="validateEmail"
                @focus="clearError"
              />
            </div>
          </div>
          
          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!isEmailValid || loading"
            class="submit-button"
          >
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
          
          <!-- Back to Login -->
          <div class="back-link">
            <span class="back-text">Remember your password? </span>
            <router-link to="/login" class="back-bold">Login</router-link>
          </div>
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
  </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: '',
      error: '',
      loading: false,
      isEmailValid: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  },
  computed: {
    containerWidth() {
      return 1920
    },
    containerHeight() {
      return 1080
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.updateScale()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
      this.updateScale()
    },
    updateScale() {
      const container = document.querySelector('.aspect-ratio-container')
      if (container) {
        const scaleX = this.windowWidth / 1920
        const scaleY = this.windowHeight / 1080
        const scale = Math.min(scaleX, scaleY)
        container.style.setProperty('--scale-factor', scale)
      }
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      this.isEmailValid = emailRegex.test(this.email)
      
      if (!this.isEmailValid && this.email) {
        this.error = 'Please enter a valid email address'
      }
    },
    clearError() {
      this.error = ''
    },
    async handleSubmit() {
      if (!this.isEmailValid) return
      
      this.loading = true
      this.error = ''
      
      try {
        const auth = getAuth()
        await sendPasswordResetEmail(auth, this.email)
        
        // Show success message
        this.$message({
          message: 'Password reset link sent! Please check your email.',
          type: 'success',
          duration: 5000
        })
        
        // Redirect to login after a short delay
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
        
      } catch (error) {
        console.error('Error sending reset email:', error)
        
        switch (error.code) {
          case 'auth/user-not-found':
            this.error = 'No account found with this email'
            break
          case 'auth/invalid-email':
            this.error = 'Invalid email address'
            break
          case 'auth/too-many-requests':
            this.error = 'Too many attempts. Please try again later'
            break
          default:
            this.error = 'Failed to send reset link. Please try again'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/auth/forgot-password.scss';
</style> 