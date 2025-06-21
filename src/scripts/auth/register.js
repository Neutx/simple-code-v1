import { validateEmail, validatePassword, validateConfirmPassword, validateDisplayName } from './validation'

export const createRegisterComposable = (store, router, message) => {
  const form = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  }

  const errors = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  let googleLoading = false

  const isFormValid = () => {
    return form.displayName && 
           form.email && 
           form.password && 
           form.confirmPassword &&
           form.agreeToTerms &&
           !errors.displayName &&
           !errors.email && 
           !errors.password && 
           !errors.confirmPassword
  }

  const handleDisplayNameValidation = () => {
    errors.displayName = validateDisplayName(form.displayName)
  }

  const handleEmailValidation = () => {
    errors.email = validateEmail(form.email)
  }

  const handlePasswordValidation = () => {
    errors.password = validatePassword(form.password)
    // Re-validate confirm password if it's already filled
    if (form.confirmPassword) {
      handleConfirmPasswordValidation()
    }
  }

  const handleConfirmPasswordValidation = () => {
    errors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword)
  }

  const clearDisplayNameError = () => {
    errors.displayName = ''
  }

  const clearEmailError = () => {
    errors.email = ''
  }

  const clearPasswordError = () => {
    errors.password = ''
  }

  const clearConfirmPasswordError = () => {
    errors.confirmPassword = ''
  }

  const handleRegister = async () => {
    if (!isFormValid()) return
    
    try {
      await store.dispatch('auth/register', {
        displayName: form.displayName,
        email: form.email,
        password: form.password
      })
      
      message.success('Account created successfully!')
      router.push('/initialize')
    } catch (error) {
      message.error(error.message || 'Registration failed')
    }
  }

  const handleGoogleRegister = async () => {
    googleLoading = true
    
    try {
      await store.dispatch('auth/loginWithGoogle')
      message.success('Account created successfully!')
      router.push('/initialize')
    } catch (error) {
      message.error(error.message || 'Google registration failed')
    } finally {
      googleLoading = false
    }
  }

  return {
    form,
    errors,
    googleLoading: () => googleLoading,
    isFormValid,
    handleDisplayNameValidation,
    handleEmailValidation,
    handlePasswordValidation,
    handleConfirmPasswordValidation,
    clearDisplayNameError,
    clearEmailError,
    clearPasswordError,
    clearConfirmPasswordError,
    handleRegister,
    handleGoogleRegister
  }
} 