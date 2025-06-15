export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return 'Email is required'
  } else if (!emailRegex.test(email)) {
    return 'Please enter a valid email'
  }
  return ''
}

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required'
  } else if (password.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return ''
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  } else if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return ''
}

export const validateDisplayName = (displayName) => {
  if (!displayName) {
    return 'Display name is required'
  } else if (displayName.length < 2) {
    return 'Display name must be at least 2 characters'
  }
  return ''
} 