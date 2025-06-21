export const createInitializeComposable = (store, router, message) => {
  let initializing = false
  let connecting = false
  let pairing = false
  let showError = false
  let hasNavigated = false

  const goBack = () => {
    router.go(-1)
  }

  const hideError = () => {
    showError = false
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      showError = false
    }, 5000)
  }

  const showConnectionError = () => {
    showError = true
    hideError()
  }

  const handleConnect = async () => {
    if (connecting || hasNavigated) return
    
    connecting = true
    
    try {
      // Check if WebHID is supported
      if (!navigator.hid) {
        showConnectionError()
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
        router.push('/dashboard/home')
      } else if (!connected) {
        showConnectionError()
      }
    } catch (error) {
      console.error('Connection error:', error)
      showConnectionError()
    } finally {
      connecting = false
    }
  }

  const handlePair = async () => {
    if (pairing || hasNavigated) return
    
    pairing = true
    
    try {
      // Check if WebHID is supported
      if (!navigator.hid) {
        showConnectionError()
        return
      }
      
      // Request device permissions
      const devices = await navigator.hid.requestDevice({
        filters: [
          { vendorId: 0x1234 }, // Replace with actual vendor IDs
          { vendorId: 0x5678 }
        ]
      })
      
      if (devices.length > 0) {
        const connected = await store.dispatch('device/connectDevice', devices[0])
        if (connected && !hasNavigated) {
          hasNavigated = true
          router.push('/dashboard/home')
        }
      } else {
        showConnectionError()
      }
    } catch (error) {
      console.error('Pairing error:', error)
      if (error.name !== 'NotAllowedError') {
        showConnectionError()
      }
    } finally {
      pairing = false
    }
  }

  const handleInitialize = async () => {
    // Fallback method for backward compatibility
    return handleConnect()
  }

  return {
    initializing: () => initializing,
    connecting: () => connecting,
    pairing: () => pairing,
    showError: () => showError,
    goBack,
    handleConnect,
    handlePair,
    handleInitialize
  }
} 