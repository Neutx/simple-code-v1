<template>
  <div class="register-container">
    <div class="background-gradient"></div>
    <div class="register-content">
      <!-- Kreo Logo -->
      <div class="logo-container">
        <img src="/logos/kreo-logo.svg" alt="Kreo" class="logo" />
      </div>
      
      <!-- Register Card -->
      <div class="register-card glass-effect">
        <div class="card-header">
          <h1 class="welcome-title">Create Account</h1>
          <p class="welcome-subtitle">Join the kreo community</p>
        </div>
        
        <form @submit.prevent="registerLogic.handleRegister" class="register-form">
          <!-- Display Name Field -->
          <div class="form-group">
            <label for="displayName" class="form-label">Display Name</label>
            <el-input
              id="displayName"
              v-model="registerLogic.form.displayName"
              placeholder="Your name"
              size="large"
              :class="{ 'error': registerLogic.errors.displayName }"
              @blur="registerLogic.handleDisplayNameValidation"
            />
            <span v-if="registerLogic.errors.displayName" class="error-text">{{ registerLogic.errors.displayName }}</span>
          </div>
          
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <el-input
              id="email"
              v-model="registerLogic.form.email"
              type="email"
              placeholder="you@email.com"
              size="large"
              :class="{ 'error': registerLogic.errors.email }"
              @blur="registerLogic.handleEmailValidation"
            />
            <span v-if="registerLogic.errors.email" class="error-text">{{ registerLogic.errors.email }}</span>
          </div>
          
          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <el-input
              id="password"
              v-model="registerLogic.form.password"
              type="password"
              placeholder="••••••••"
              size="large"
              show-password
              :class="{ 'error': registerLogic.errors.password }"
              @blur="registerLogic.handlePasswordValidation"
            />
            <span v-if="registerLogic.errors.password" class="error-text">{{ registerLogic.errors.password }}</span>
          </div>
          
          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <el-input
              id="confirmPassword"
              v-model="registerLogic.form.confirmPassword"
              type="password"
              placeholder="••••••••"
              size="large"
              show-password
              :class="{ 'error': registerLogic.errors.confirmPassword }"
              @blur="registerLogic.handleConfirmPasswordValidation"
            />
            <span v-if="registerLogic.errors.confirmPassword" class="error-text">{{ registerLogic.errors.confirmPassword }}</span>
          </div>
          
          <!-- Terms Agreement -->
          <el-checkbox v-model="registerLogic.form.agreeToTerms" class="terms-checkbox">
            I agree to the <router-link to="/terms">Terms of Service</router-link> and <router-link to="/privacy">Privacy Policy</router-link>
          </el-checkbox>
          
          <!-- Register Button -->
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!registerLogic.isFormValid()"
            class="register-button gradient-bg"
            native-type="submit"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </el-button>
          
          <!-- Login Link -->
          <div class="login-link">
            <span>Already have an account? </span>
            <router-link to="/login" class="login-text">Sign in</router-link>
          </div>
          
          <!-- Divider -->
          <div class="divider">
            <span class="divider-text">or</span>
          </div>
          
          <!-- Google Sign Up -->
          <el-button
            size="large"
            :loading="registerLogic.googleLoading()"
            @click="registerLogic.handleGoogleRegister"
            class="google-button"
          >
            Sign up with Google
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
import { createRegisterComposable } from '@/scripts/auth/register'

export default {
  name: 'RegisterView',
  data() {
    return {
      registerLogic: null
    }
  },
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  created() {
    // Initialize register logic
    this.registerLogic = createRegisterComposable(this.$store, this.$router, this.$message)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/auth/register.scss';
</style> 