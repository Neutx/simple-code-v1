export const createInitializeComposable = (store, router, message) => {
  let initializing = false

  const goBack = () => {
    router.go(-1)
  }

  const handleInitialize = async () => {
    initializing = true
    
    try {
      // Check if WebHID is supported
      if (!navigator.hid) {
        message.error('WebHID is not supported in this browser. Please use Chrome, Edge, or Opera.')
        return
      }
      
      // Attempt to connect to device
      const connected = await store.dispatch('device/connectDevice')
      
      if (connected) {
        message.success('Device connected successfully!')
        router.push('/dashboard/home')
      } else {
        message.warning('No compatible device found. Please connect your mouse and try again.')
      }
    } catch (error) {
      console.error('Initialization error:', error)
      message.error('Failed to initialize device connection')
    } finally {
      initializing = false
    }
  }

  const checkDeviceConnection = (isConnected, router) => {
    if (isConnected) {
      router.push('/dashboard/home')
    }
  }

  return {
    initializing: () => initializing,
    goBack,
    handleInitialize,
    checkDeviceConnection
  }
} 