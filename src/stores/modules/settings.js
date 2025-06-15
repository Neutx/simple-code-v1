const state = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  autoSave: true,
  pollingRate: 1000,
  dpiSettings: {
    stages: [400, 800, 1600, 3200],
    current: 0
  },
  keyMappings: {},
  rgbSettings: {
    enabled: true,
    brightness: 100,
    effect: 'static',
    color: '#8B5CF6'
  },
  sensorSettings: {
    lod: 2,
    angleSnapping: false,
    motionSync: true
  }
}

const getters = {
  theme: state => state.theme,
  language: state => state.language,
  notifications: state => state.notifications,
  autoSave: state => state.autoSave,
  pollingRate: state => state.pollingRate,
  dpiSettings: state => state.dpiSettings,
  keyMappings: state => state.keyMappings,
  rgbSettings: state => state.rgbSettings,
  sensorSettings: state => state.sensorSettings,
  isDarkTheme: state => state.theme === 'dark'
}

const mutations = {
  SET_THEME(state, theme) {
    state.theme = theme
  },
  SET_LANGUAGE(state, language) {
    state.language = language
  },
  SET_NOTIFICATIONS(state, enabled) {
    state.notifications = enabled
  },
  SET_AUTO_SAVE(state, enabled) {
    state.autoSave = enabled
  },
  SET_POLLING_RATE(state, rate) {
    state.pollingRate = rate
  },
  SET_DPI_SETTINGS(state, settings) {
    state.dpiSettings = { ...state.dpiSettings, ...settings }
  },
  SET_KEY_MAPPINGS(state, mappings) {
    state.keyMappings = mappings
  },
  SET_RGB_SETTINGS(state, settings) {
    state.rgbSettings = { ...state.rgbSettings, ...settings }
  },
  SET_SENSOR_SETTINGS(state, settings) {
    state.sensorSettings = { ...state.sensorSettings, ...settings }
  },
  RESET_SETTINGS(state) {
    state.dpiSettings = {
      stages: [400, 800, 1600, 3200],
      current: 0
    }
    state.keyMappings = {}
    state.rgbSettings = {
      enabled: true,
      brightness: 100,
      effect: 'static',
      color: '#8B5CF6'
    }
    state.sensorSettings = {
      lod: 2,
      angleSnapping: false,
      motionSync: true
    }
  }
}

const actions = {
  // Theme actions
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
    localStorage.setItem('kreo_theme', theme)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
  },

  // Language actions
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
    localStorage.setItem('kreo_language', language)
  },

  // Notification actions
  setNotifications({ commit }, enabled) {
    commit('SET_NOTIFICATIONS', enabled)
    localStorage.setItem('kreo_notifications', enabled.toString())
  },

  // Auto-save actions
  setAutoSave({ commit }, enabled) {
    commit('SET_AUTO_SAVE', enabled)
    localStorage.setItem('kreo_auto_save', enabled.toString())
  },

  // DPI actions
  updateDPISettings({ commit, dispatch }, settings) {
    commit('SET_DPI_SETTINGS', settings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setCurrentDPI({ commit, dispatch }, index) {
    commit('SET_DPI_SETTINGS', { current: index })
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Key mapping actions
  updateKeyMappings({ commit, dispatch }, mappings) {
    commit('SET_KEY_MAPPINGS', mappings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // RGB actions
  updateRGBSettings({ commit, dispatch }, settings) {
    commit('SET_RGB_SETTINGS', settings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Sensor actions
  updateSensorSettings({ commit, dispatch }, settings) {
    commit('SET_SENSOR_SETTINGS', settings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Polling rate actions
  setPollingRate({ commit, dispatch }, rate) {
    commit('SET_POLLING_RATE', rate)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Load settings from localStorage
  loadLocalSettings({ commit }) {
    const theme = localStorage.getItem('kreo_theme') || 'dark'
    const language = localStorage.getItem('kreo_language') || 'en'
    const notifications = localStorage.getItem('kreo_notifications') !== 'false'
    const autoSave = localStorage.getItem('kreo_auto_save') !== 'false'

    commit('SET_THEME', theme)
    commit('SET_LANGUAGE', language)
    commit('SET_NOTIFICATIONS', notifications)
    commit('SET_AUTO_SAVE', autoSave)

    // Apply theme
    document.documentElement.setAttribute('data-theme', theme)
  },

  // Save settings to cloud (Firestore)
  async saveSettingsToCloud({ rootState }) {
    try {
      if (!rootState.auth.user) return

      const settingsData = {
        dpiSettings: state.dpiSettings,
        keyMappings: state.keyMappings,
        rgbSettings: state.rgbSettings,
        sensorSettings: state.sensorSettings,
        pollingRate: state.pollingRate,
        updatedAt: new Date().toISOString()
      }

      // This will be implemented when device store is connected
      await rootState.device.saveDeviceSettings(settingsData)
    } catch (error) {
      console.error('Error saving settings to cloud:', error)
    }
  },

  // Reset all settings to defaults
  resetAllSettings({ commit, dispatch }) {
    commit('RESET_SETTINGS')
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
} 