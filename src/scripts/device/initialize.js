export const createInitializeComposable = (store, router, message) => {
  let initializing = false
  let hasNavigated = false

  const goBack = () => {
    router.go(-1)
  }

  const handleInitialize = async () => {
    if (initializing || hasNavigated) return
    
    initializing = true
    
    try {
      // Check if WebHID is supported
      if (!navigator.hid) {
        message.error('WebHID is not supported in this browser. Please use Chrome, Edge, or Opera.')
        return
      }
      
      const connectWithTimeout = Promise.race([
        store.dispatch('device/connectDevice'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 15000)
        )
      ])
      
      // Attempt to connect to device
      const connected = await connectWithTimeout
      
      if (connected && !hasNavigated) {
        hasNavigated = true
        message.success('Device connected successfully!')
        router.push('/dashboard/home')
      } else if (!connected) {
        message.warning('No compatible device found. Please connect your mouse and try again.')
      }
    } catch (error) {
      console.error('Initialization error:', error)
      if (error.message === 'Connection timeout') {
        message.error('Device connection timed out. Please try again.')
      } else {
        message.error('Failed to initialize device connection')
      }
    } finally {
      initializing = false
    }
  }

  return {
    initializing: () => initializing,
    goBack,
    handleInitialize
  }
} 