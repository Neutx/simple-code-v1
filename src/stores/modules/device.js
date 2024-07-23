import HIDHandle from '@/assets/js/HIDHandle'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/utils/firebase'
import router from '@/router'
import { createNavigationComposable } from '@/scripts/dashboard/navigation'

const navigation = createNavigationComposable(router)

// Set up disconnect callback when HIDHandle is imported
HIDHandle.Set_Disconnect_Callback(() => {
  console.log("📞 HIDHandle disconnect callback triggered")

  try {
    // Safely get current path with fallback
    const currentPath = router.currentRoute?.value?.path || window.location.pathname
    console.log("Current path:", currentPath)

    if (currentPath !== '/initialize' && !currentPath.startsWith('/auth')) {
      console.log("🔄 Physical disconnect detected - redirecting to /initialize")
      navigation.goBack()
    }
  } catch (error) {
    console.error("Error in disconnect callback:", error)
    // Fallback to window location
    if (window.location.pathname !== '/initialize' && !window.location.pathname.startsWith('/auth')) {
      window.location.href = '/initialize'
    }
  }
})

const state = {
  connected: false,
  connecting: false,
  pairing: false,
  deviceInfo: HIDHandle.deviceInfo,
  battery: {
    level: 0,
    charging: false
  },
  currentSettings: null,
  error: null
}

const getters = {
  isConnected: state => state.connected || HIDHandle.deviceInfo.deviceOpen,
  isConnecting: state => state.connecting,
  isPairing: state => state.pairing,
  deviceInfo: () => HIDHandle.deviceInfo,
  battery: state => HIDHandle.deviceInfo.battery || state.battery,
  currentSettings: state => state.currentSettings,
  error: state => state.error,
  currentDPI: () => {
    const dpiIndex = HIDHandle.deviceInfo.mouseCfg.currentDpi;
    return HIDHandle.deviceInfo.mouseCfg.dpis[dpiIndex]?.value || 1600;
  },
  pollingRate: () => HIDHandle.deviceInfo.mouseCfg.reportRate || 1000,
  batteryLevel: () => HIDHandle.deviceInfo.battery.level || 0,
  batteryCharging: () => HIDHandle.deviceInfo.battery.charging || false,
  connectionState: () => HIDHandle.deviceInfo.connectState,
  isOnline: () => HIDHandle.deviceInfo.online
}

const mutations = {
  SET_CONNECTED(state, connected) {
    state.connected = connected
  },
  SET_CONNECTING(state, connecting) {
    state.connecting = connecting
  },
  SET_PAIRING(state, pairing) {
    state.pairing = pairing
  },
  SET_DEVICE_INFO(state, info) {
    state.connected = info ? true : false
  },
  SET_BATTERY(state, battery) {
    state.battery = battery
  },
  SET_CURRENT_SETTINGS(state, settings) {
    state.currentSettings = settings
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  },
  SYNC_WITH_HIDHANDLE(state) {
    state.connected = HIDHandle.deviceInfo.deviceOpen
    state.battery = HIDHandle.deviceInfo.battery
  }
}

const actions = {
  async connectDevice({ commit, dispatch, rootState }) {
    commit('SET_CONNECTING', true)
    commit('CLEAR_ERROR')

    try {
      console.log("🔄 Store: Starting device connection...")

      const filters = []

      if (await HIDHandle.Request_Device(filters)) {
        const info = await HIDHandle.Get_Device_Info()
        console.log("🔍 Store: Device info retrieved:", info)

        if ((info.cid != 0) && (info.mid != 0)) {
          console.log("✅ Store: Valid device, configuring...")

          HIDHandle.deviceInfo.mouseCfg.sensor.cfg = {
            range: [
              {
                min: 50,
                max: 26000,
                step: 50,
                DPIex: 0
              },
              {
                min: 26100,
                max: 52000,
                step: 100,
                DPIex: 17
              }
            ]
          }
          HIDHandle.deviceInfo.mouseCfg.keysCount = 6

          console.log("🔧 Store: Sensor configured, connecting...")

          await HIDHandle.Device_Connect()

          console.log("🎉 Store: Device connected successfully!")
          console.log("📊 Store: HIDHandle state:", HIDHandle.deviceInfo)

          commit('SET_DEVICE_INFO', HIDHandle.deviceInfo)
          commit('SET_CONNECTED', true)

          console.log("🔗 Device connection established - HIDHandle.deviceInfo updated")

          if (HIDHandle.deviceInfo.battery) {
            commit('SET_BATTERY', HIDHandle.deviceInfo.battery)
          }

          if (rootState.auth.user) {
            dispatch('saveDeviceConnection', {
              userId: rootState.auth.user.uid,
              deviceInfo: info
            }).catch(error => {
              console.error('Error saving device connection:', error)
            })
          }

          dispatch('startRealTimeMonitoring')

          return true
        } else {
          console.error("❌ Store: Invalid device - cid or mid is 0")
          commit('SET_ERROR', 'Invalid device detected')
          return false
        }
      } else {
        console.error("❌ Store: No device selected")
        commit('SET_ERROR', 'No device selected')
        return false
      }
    } catch (error) {
      console.error("❌ Store: Connection error:", error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_CONNECTING', false)
    }
  },

  startRealTimeMonitoring({ commit }) {
    console.log("🔄 Starting real-time HIDHandle monitoring...")

    if (window.deviceMonitorInterval) {
      clearInterval(window.deviceMonitorInterval)
    }

    const monitorInterval = setInterval(() => {
      const device = HIDHandle.deviceInfo

      // Check if device is effectively connected
      // For wired: just need deviceOpen to be true
      // For wireless: need both deviceOpen AND online to be true
      const isEffectivelyConnected = device.deviceOpen && (device.isWired || device.online)

      if (isEffectivelyConnected) {
        commit('SYNC_WITH_HIDHANDLE')

        console.log("📊 Real-time sync:", {
          connected: device.deviceOpen,
          connectState: device.connectState,
          battery: device.battery.level + "%",
          dpi: device.mouseCfg.dpis[device.mouseCfg.currentDpi]?.value,
          reportRate: device.mouseCfg.reportRate + "Hz",
          online: device.online,
          isWired: device.isWired,
          timestamp: new Date().toISOString()
        })
      } else {
        // Device disconnected or went offline - handle disconnection
        console.log("❌ Device disconnected or offline - stopping monitoring and redirecting", {
          deviceOpen: device.deviceOpen,
          online: device.online,
          isWired: device.isWired,
          connectState: device.connectState
        })

        // Stop the monitoring interval first to prevent multiple triggers
        clearInterval(monitorInterval)
        window.deviceMonitorInterval = null

        // Update state
        commit('SET_CONNECTED', false)
        commit('SET_DEVICE_INFO', null)
        commit('SET_CURRENT_SETTINGS', null)
        commit('SET_BATTERY', { level: 0, charging: false })

        // Redirect to initialize page if not already there
        try {
          const currentPath = router.currentRoute?.value?.path || window.location.pathname
          if (currentPath !== '/initialize' && !currentPath.startsWith('/auth')) {
            console.log("🔄 Redirecting to /initialize page due to device disconnection")
            navigation.goBack()
          }
        } catch (error) {
          console.error("Error in monitoring redirect:", error)
          if (window.location.pathname !== '/initialize' && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/initialize'
          }
        }
      }
    }, 1500) // Check every 1.5 seconds

    window.deviceMonitorInterval = monitorInterval
  },

  stopRealTimeMonitoring() {
    if (window.deviceMonitorInterval) {
      clearInterval(window.deviceMonitorInterval)
      window.deviceMonitorInterval = null
      console.log("🛑 Real-time monitoring stopped")
    }
  },

  async disconnectDevice({ commit, dispatch }) {
    try {
      dispatch('stopRealTimeMonitoring')
      commit('SET_CONNECTED', false)
      commit('SET_DEVICE_INFO', null)
      commit('SET_CURRENT_SETTINGS', null)
      commit('SET_BATTERY', { level: 0, charging: false })
      console.log("🔌 Device disconnected")
    } catch (error) {
      commit('SET_ERROR', error.message)
    }
  },

  updateBattery({ commit }, battery) {
    commit('SET_BATTERY', battery)
  },

  syncWithHIDHandle({ commit }) {
    commit('SYNC_WITH_HIDHANDLE')
  },

  async saveDeviceConnection(context, { userId, deviceInfo }) {
    try {
      const deviceRef = doc(db, 'users', userId, 'devices', deviceInfo.cid + '_' + deviceInfo.mid)

      const deviceData = {
        cid: deviceInfo.cid,
        mid: deviceInfo.mid,
        type: deviceInfo.type,
        lastConnected: serverTimestamp(),
        connectionCount: 1
      }

      const existingDoc = await getDoc(deviceRef)
      if (existingDoc.exists()) {
        deviceData.connectionCount = existingDoc.data().connectionCount + 1
      }

      await setDoc(deviceRef, deviceData, { merge: true })
    } catch (error) {
      console.error('Error saving device connection:', error)
    }
  },

  async saveDeviceSettings({ commit, rootState }, settings) {
    try {
      if (!rootState.auth.user || !state.deviceInfo) return

      const deviceId = state.deviceInfo.cid + '_' + state.deviceInfo.mid
      const settingsRef = doc(db, 'users', rootState.auth.user.uid, 'deviceSettings', deviceId)

      const settingsData = {
        deviceId: deviceId,
        settings: settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(settingsRef, settingsData, { merge: true })
      commit('SET_CURRENT_SETTINGS', settings)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async loadDeviceSettings({ commit, rootState }, deviceId) {
    try {
      if (!rootState.auth.user) return null

      const settingsRef = doc(db, 'users', rootState.auth.user.uid, 'deviceSettings', deviceId)
      const settingsDoc = await getDoc(settingsRef)

      if (settingsDoc.exists()) {
        const settings = settingsDoc.data().settings
        commit('SET_CURRENT_SETTINGS', settings)
        return settings
      }

      return null
    } catch (error) {
      commit('SET_ERROR', error.message)
      return null
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