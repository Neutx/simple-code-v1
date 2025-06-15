import { validateEmail, validatePassword } from './validation'

export const createLoginComposable = (store, router, message) => {
  const form = {
    email: '',
    password: '',
    rememberMe: false
  }

  const errors = {
    email: '',
    password: ''
  }

  let googleLoading = false

  const isFormValid = () => {
    return form.email && 
           form.password && 
           !errors.email && 
           !errors.password
  }

  const handleEmailValidation = () => {
    errors.email = validateEmail(form.email)
  }

  const handlePasswordValidation = () => {
    errors.password = validatePassword(form.password)
  }

  const handleLogin = async () => {
    if (!isFormValid()) return
    
    try {
      await store.dispatch('auth/login', {
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe
      })

      if (form.rememberMe) {
        localStorage.setItem('savedEmail', form.email)
      } else {
        localStorage.removeItem('savedEmail')
      }
      
      message.success('Login successful!')
      
      const isConnected = store.getters['device/isConnected']
      router.push(isConnected ? '/dashboard/home' : '/initialize')
    } catch (error) {
      message.error(error.message || 'Login failed')
    }
  }

  const handleGoogleLogin = async () => {
    googleLoading = true
    
    try {
      await store.dispatch('auth/loginWithGoogle')
      message.success('Login successful!')
      
      const isConnected = store.getters['device/isConnected']
      router.push(isConnected ? '/dashboard/home' : '/initialize')
    } catch (error) {
      message.error(error.message || 'Google login failed')
    } finally {
      googleLoading = false
    }
  }

  const initializeRememberMe = () => {
    const rememberMe = localStorage.getItem('rememberMe')
    if (rememberMe === 'true') {
      form.rememberMe = true
      const savedEmail = localStorage.getItem('savedEmail')
      if (savedEmail) {
        form.email = savedEmail
      }
    }
  }

  return {
    form,
    errors,
    googleLoading: () => googleLoading,
    isFormValid,
    handleEmailValidation,
    handlePasswordValidation,
    handleLogin,
    handleGoogleLogin,
    initializeRememberMe
  }
} 