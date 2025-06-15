export const createUserMenuComposable = (store, router, message) => {
  let showUserMenu = false

  const toggleUserMenu = () => {
    showUserMenu = !showUserMenu
  }

  const closeUserMenu = () => {
    showUserMenu = false
  }

  const handleLogout = async () => {
    try {
      await store.dispatch('device/disconnectDevice')
      await store.dispatch('auth/logout')
      message.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      message.error('Logout failed')
    }
  }

  const setupOutsideClickListener = (element) => {
    const handleOutsideClick = (e) => {
      if (!element.contains(e.target)) {
        closeUserMenu()
      }
    }

    document.addEventListener('click', handleOutsideClick)
    
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }

  return {
    showUserMenu: () => showUserMenu,
    toggleUserMenu,
    closeUserMenu,
    handleLogout,
    setupOutsideClickListener
  }
} 