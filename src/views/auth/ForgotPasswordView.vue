<template>
  <div class="forgot-password-container">
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
</template>

<script>
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Lottie from 'vue-lottie/src/lottie.vue';
import animationData from '@/../public/img/home-bg.json';

export default {
  name: 'ForgotPasswordView',
  components: {
    Lottie
  },
  data() {
    return {
      email: '',
      error: '',
      loading: false,
      isEmailValid: false,
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
.forgot-password-container {
  min-height: 100vh;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: #000000;
}

.background-lottie {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  > div {
    width: 100% !important;
    height: 100% !important;
    min-width: 100vw;
    min-height: 100vh;
    
    svg {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
      min-width: 100vw;
      min-height: 100vh;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.2) 100%);
    z-index: 1;
    pointer-events: none;
  }
}

.forgot-password-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  width: 100%;
  position: relative;
  min-height: 100vh;
  padding: 2vh 2vw;
  box-sizing: border-box;
}

.logo-container {
  margin-top: 5vh;
  margin-bottom: 5vh;
  z-index: 2;
  flex-shrink: 0;
}

.logo {
  width: min(143px, 20vw);
  height: auto;
  aspect-ratio: 143/44;
  filter: brightness(0) invert(1);
}

.forgot-password-card {
  width: min(471px, 90vw);
  height: auto;
  min-height: min(500px, 60vh);
  position: relative;
  background: rgba(0, 0, 0, 0.765);
  border-radius: 24px;
  border: 5px solid rgba(115, 115, 115, 0.2);
  backdrop-filter: blur(20.1px);
  overflow: hidden;
  padding: min(40px, 5vw);
  z-index: 2;
  flex-shrink: 0;
  margin-bottom: 2vh;
}

.card-header {
  margin-bottom: 32px;
}

.title {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 700;
  line-height: 1.2;
  color: #A855F7;
  margin: 0;
  margin-bottom: 8px;
}

.subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(12px, 2.5vw, 16px);
  font-weight: 400;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(16px, 3vw, 20px);
  font-weight: 600;
  line-height: 1.5;
  color: white;
  margin: 0;
}

.input-wrapper {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  border: 1px solid #6B7280;
  overflow: hidden;
  position: relative;
  background: transparent;
  transition: all 0.2s ease;
  
  &:focus-within {
    border: 1.5px solid #A855F7;
    border-color: #A855F7;
  }
  
  &.error-state {
    border: 1px solid #ef4444;
    
    &:focus-within {
      border: 1.5px solid #ef4444;
    }
  }
}

.form-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 36px;
  padding: 6px 15px;
  outline: none;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }
  
  &:not(:placeholder-shown) {
    color: white;
    background: #374151;
  }
  
  &:focus {
    color: white;
    
    &:not(:placeholder-shown) {
      background: #374151;
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  &.error-input {
    color: #ef4444;
    
    &::placeholder {
      color: #ef4444;
    }
  }
}

.submit-button {
  width: 100%;
  height: 48px;
  background: #A855F7;
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  
  &:hover:not(:disabled) {
    background: #9333EA;
  }
  
  &:disabled {
    background: rgba(168, 85, 247, 0.5);
    cursor: not-allowed;
  }
}

.back-link {
  text-align: center;
  margin-top: 16px;
}

.back-text {
  color: rgba(255, 255, 255, 0.5);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
}

.back-bold {
  color: #A855F7;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  
  &:hover {
    text-decoration: underline;
  }
}

.footer {
  margin-top: auto;
  padding: 20px;
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
  }
}

.copyright {
  color: rgba(255, 255, 255, 0.3);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
}

@media (max-width: 768px) {
  .forgot-password-card {
    padding: min(24px, 4vw);
  }
  
  .footer {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style> 