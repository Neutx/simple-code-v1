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
    sensorMode: 0,           // 0: Low Power, 1: High Power, 256: Corded
    lod: 1,                  // Lift-off distance (1mm, 2mm)
    performanceState: false, // Highest performance mode enabled/disabled
    performance: 6,          // Sleep timer value (1-240 range)
    ripple: false,          // Ripple control
    angle: false,           // Angle snapping
    motionSync: true,       // Motion sync
    pollingRate: 1000,      // Polling rate (125, 500, 1000, 2000, 4000)
    sleepTimer: 6,          // Sleep timer (maps to performance)
    isWired: false,         // Device connection type
    corderMode: false       // Corded mode active
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
  isDarkTheme: state => state.theme === 'dark',
  
  // Sensor-specific getters
  sensorMode: state => state.sensorSettings.sensorMode,
  sensorLOD: state => state.sensorSettings.lod,
  sensorPerformanceState: state => state.sensorSettings.performanceState,
  sensorPerformance: state => state.sensorSettings.performance,
  sensorRipple: state => state.sensorSettings.ripple,
  sensorAngle: state => state.sensorSettings.angle,
  sensorMotionSync: state => state.sensorSettings.motionSync,
  sensorPollingRate: state => state.sensorSettings.pollingRate,
  sensorSleepTimer: state => state.sensorSettings.sleepTimer,
  isWiredDevice: state => state.sensorSettings.isWired,
  isCorderMode: state => state.sensorSettings.corderMode
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
    state.dpiSettings = settings
  },
  SET_KEY_MAPPINGS(state, mappings) {
    state.keyMappings = mappings
  },
  SET_RGB_SETTINGS(state, settings) {
    state.rgbSettings = settings
  },
  
  // Sensor settings mutations
  SET_SENSOR_MODE(state, mode) {
    state.sensorSettings.sensorMode = mode
  },
  SET_SENSOR_LOD(state, lod) {
    state.sensorSettings.lod = lod
  },
  SET_SENSOR_PERFORMANCE_STATE(state, enabled) {
    state.sensorSettings.performanceState = enabled
  },
  SET_SENSOR_PERFORMANCE(state, performance) {
    state.sensorSettings.performance = performance
    state.sensorSettings.sleepTimer = performance // Keep in sync
  },
  SET_SENSOR_RIPPLE(state, enabled) {
    state.sensorSettings.ripple = enabled
  },
  SET_SENSOR_ANGLE(state, enabled) {
    state.sensorSettings.angle = enabled
  },
  SET_SENSOR_MOTION_SYNC(state, enabled) {
    state.sensorSettings.motionSync = enabled
  },
  SET_SENSOR_POLLING_RATE(state, rate) {
    state.sensorSettings.pollingRate = rate
    state.pollingRate = rate // Keep main polling rate in sync
  },
  SET_SENSOR_SLEEP_TIMER(state, timer) {
    state.sensorSettings.sleepTimer = timer
    state.sensorSettings.performance = timer // Keep in sync
  },
  SET_WIRED_DEVICE(state, isWired) {
    state.sensorSettings.isWired = isWired
  },
  SET_CORDER_MODE(state, enabled) {
    state.sensorSettings.corderMode = enabled
  },
  
  // Bulk update sensor settings
  UPDATE_SENSOR_SETTINGS(state, settings) {
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
      sensorMode: 0,
      lod: 1,
      performanceState: false,
      performance: 6,
      ripple: false,
      angle: false,
      motionSync: true,
      pollingRate: 1000,
      sleepTimer: 6,
      isWired: false,
      corderMode: false
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
  updateDPISettings({ commit, dispatch, state }, settings) {
    commit('SET_DPI_SETTINGS', settings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setCurrentDPI({ commit, dispatch, state }, index) {
    commit('SET_DPI_SETTINGS', { current: index })
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Key mapping actions
  updateKeyMappings({ commit, dispatch, state }, mappings) {
    commit('SET_KEY_MAPPINGS', mappings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // RGB actions
  updateRGBSettings({ commit, dispatch, state }, settings) {
    commit('SET_RGB_SETTINGS', settings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Sensor settings actions
  setSensorMode({ commit, dispatch, state }, mode) {
    commit('SET_SENSOR_MODE', mode)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorLOD({ commit, dispatch, state }, lod) {
    commit('SET_SENSOR_LOD', lod)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorPerformanceState({ commit, dispatch, state }, enabled) {
    commit('SET_SENSOR_PERFORMANCE_STATE', enabled)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorPerformance({ commit, dispatch, state }, performance) {
    commit('SET_SENSOR_PERFORMANCE', performance)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorRipple({ commit, dispatch, state }, enabled) {
    commit('SET_SENSOR_RIPPLE', enabled)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorAngle({ commit, dispatch, state }, enabled) {
    commit('SET_SENSOR_ANGLE', enabled)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorMotionSync({ commit, dispatch, state }, enabled) {
    commit('SET_SENSOR_MOTION_SYNC', enabled)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorPollingRate({ commit, dispatch, state }, rate) {
    commit('SET_SENSOR_POLLING_RATE', rate)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setSensorSleepTimer({ commit, dispatch, state }, timer) {
    commit('SET_SENSOR_SLEEP_TIMER', timer)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  setWiredDevice({ commit }, isWired) {
    commit('SET_WIRED_DEVICE', isWired)
  },

  setCorderMode({ commit }, enabled) {
    commit('SET_CORDER_MODE', enabled)
  },

  // Bulk update sensor settings
  updateSensorSettings({ commit, dispatch, state }, settings) {
    commit('UPDATE_SENSOR_SETTINGS', settings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
  },

  // Initialize sensor settings from device
  initializeSensorSettingsFromDevice({ commit }, deviceInfo) {
    if (!deviceInfo || !deviceInfo.mouseCfg || !deviceInfo.mouseCfg.sensor) {
      return
    }

    const sensor = deviceInfo.mouseCfg.sensor
    const reportRate = deviceInfo.mouseCfg.reportRate

    const sensorSettings = {
      sensorMode: sensor.sensorMode !== undefined ? sensor.sensorMode : 0,
      lod: sensor.lod !== undefined ? sensor.lod : 1,
      performanceState: sensor.performanceState !== undefined ? Boolean(sensor.performanceState) : false,
      performance: sensor.performance !== undefined ? sensor.performance : 6,
      ripple: sensor.ripple !== undefined ? Boolean(sensor.ripple) : false,
      angle: sensor.angle !== undefined ? Boolean(sensor.angle) : false,
      motionSync: sensor.motionSync !== undefined ? Boolean(sensor.motionSync) : true,
      pollingRate: reportRate !== undefined ? reportRate : 1000,
      sleepTimer: sensor.performance !== undefined ? sensor.performance : 6,
      isWired: deviceInfo.isWired !== undefined ? Boolean(deviceInfo.isWired) : false,
      corderMode: reportRate > 1000 ? true : false
    }

    commit('UPDATE_SENSOR_SETTINGS', sensorSettings)
  },

  // Load settings from localStorage
  loadSettingsFromLocalStorage({ commit }) {
    try {
      // Load theme
      const theme = localStorage.getItem('kreo_theme')
      if (theme) {
        commit('SET_THEME', theme)
        document.documentElement.setAttribute('data-theme', theme)
      }

      // Load language
      const language = localStorage.getItem('kreo_language')
      if (language) {
        commit('SET_LANGUAGE', language)
      }

      // Load notifications
      const notifications = localStorage.getItem('kreo_notifications')
      if (notifications !== null) {
        commit('SET_NOTIFICATIONS', notifications === 'true')
      }

      // Load auto-save
      const autoSave = localStorage.getItem('kreo_auto_save')
      if (autoSave !== null) {
        commit('SET_AUTO_SAVE', autoSave === 'true')
      }

      // Load sensor settings
      const sensorSettings = localStorage.getItem('kreo_sensor_settings')
      if (sensorSettings) {
        const parsedSettings = JSON.parse(sensorSettings)
        commit('UPDATE_SENSOR_SETTINGS', parsedSettings)
      }

      // Load DPI settings
      const dpiSettings = localStorage.getItem('kreo_dpi_settings')
      if (dpiSettings) {
        const parsedSettings = JSON.parse(dpiSettings)
        commit('SET_DPI_SETTINGS', parsedSettings)
      }

      // Load RGB settings
      const rgbSettings = localStorage.getItem('kreo_rgb_settings')
      if (rgbSettings) {
        const parsedSettings = JSON.parse(rgbSettings)
        commit('SET_RGB_SETTINGS', parsedSettings)
      }

      // Load key mappings
      const keyMappings = localStorage.getItem('kreo_key_mappings')
      if (keyMappings) {
        const parsedMappings = JSON.parse(keyMappings)
        commit('SET_KEY_MAPPINGS', parsedMappings)
      }

    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
    }
  },

  // Save settings to localStorage
  saveSettingsToLocalStorage({ state }) {
    try {
      localStorage.setItem('kreo_sensor_settings', JSON.stringify(state.sensorSettings))
      localStorage.setItem('kreo_dpi_settings', JSON.stringify(state.dpiSettings))
      localStorage.setItem('kreo_rgb_settings', JSON.stringify(state.rgbSettings))
      localStorage.setItem('kreo_key_mappings', JSON.stringify(state.keyMappings))
      localStorage.setItem('kreo_theme', state.theme)
      localStorage.setItem('kreo_language', state.language)
      localStorage.setItem('kreo_notifications', state.notifications.toString())
      localStorage.setItem('kreo_auto_save', state.autoSave.toString())
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
    }
  },

  // Save settings to cloud (placeholder for future implementation)
  async saveSettingsToCloud({ state, rootState }) {
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
  resetAllSettings({ commit, dispatch, state }) {
    commit('RESET_SETTINGS')
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
    
    // Also save to localStorage
    dispatch('saveSettingsToLocalStorage')
  },

  // Reset only sensor settings to defaults
  resetSensorSettings({ commit, dispatch, state }) {
    const defaultSensorSettings = {
      sensorMode: 0,           // Low Power
      lod: 1,                  // 1mm
      performanceState: false, // Disabled
      performance: 6,          // 1 min sleep timer
      ripple: false,          // Off
      angle: false,           // Off
      motionSync: true,       // On
      pollingRate: 1000,      // 1000Hz
      sleepTimer: 6,          // 1 min
      isWired: false,         // Default to wireless
      corderMode: false       // Default to non-corded
    }

    commit('UPDATE_SENSOR_SETTINGS', defaultSensorSettings)
    
    if (state.autoSave) {
      dispatch('saveSettingsToCloud')
    }
    
    // Also save to localStorage
    dispatch('saveSettingsToLocalStorage')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
} 