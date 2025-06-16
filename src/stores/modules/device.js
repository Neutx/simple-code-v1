import HIDHandle from '@/assets/js/HIDHandle'
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/utils/firebase'

const state = {
  connected: false,
  connecting: false,
  pairing: false,
  deviceInfo: null,
  battery: {
    level: 0,
    charging: false
  },
  currentSettings: null,
  error: null
}

const getters = {
  isConnected: state => state.connected,
  isConnecting: state => state.connecting,
  isPairing: state => state.pairing,
  deviceInfo: state => state.deviceInfo,
  battery: state => state.battery,
  currentSettings: state => state.currentSettings,
  error: state => state.error
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
    state.deviceInfo = info
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
  }
}

const actions = {
  // Connect to device
  async connectDevice({ commit, dispatch, rootState }) {
    commit('SET_CONNECTING', true)
    commit('CLEAR_ERROR')
    
    try {
      const filters = []
      
      if (await HIDHandle.Request_Device(filters)) {
        const info = await HIDHandle.Get_Device_Info()
        
        if ((info.cid != 0) && (info.mid != 0)) {
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
          
          // Start device connection (this will handle the rest in background)
          HIDHandle.Device_Connect()
          
          commit('SET_DEVICE_INFO', HIDHandle.deviceInfo)
          commit('SET_CONNECTED', true)
          
          if (HIDHandle.deviceInfo.battery) {
            commit('SET_BATTERY', HIDHandle.deviceInfo.battery)
          }
          // Save device connection to user's profile (non-blocking)
          if (rootState.auth.user) {
            dispatch('saveDeviceConnection', {
              userId: rootState.auth.user.uid,
              deviceInfo: info
            }).catch(error => {
              console.error('Error saving device connection:', error)
            })
          }
          
          return true
        }
      }
      return false
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_CONNECTING', false)
    }
  },

  // Disconnect device
  async disconnectDevice({ commit }) {
    try {
      commit('SET_CONNECTED', false)
      commit('SET_DEVICE_INFO', null)
      commit('SET_CURRENT_SETTINGS', null)
      commit('SET_BATTERY', { level: 0, charging: false })
    } catch (error) {
      commit('SET_ERROR', error.message)
    }
  },

  // Pair device
  async pairDevice({ commit }) {
    commit('SET_PAIRING', true)
    commit('CLEAR_ERROR')
    
    try {
      const filters = []
      
      if (await HIDHandle.Request_Device(filters)) {
        const info = await HIDHandle.Get_Device_Info()
        
        if ((info.cid != 0) && (info.mid != 0)) {
          await HIDHandle.Set_Device_EnterPairMode()
          
          // Monitor pairing status
          const checkPairStatus = () => {
            if (HIDHandle.pairResult.pairStatus === HIDHandle.DevicePairResult.Success) {
              commit('SET_PAIRING', false)
              return true
            } else if (HIDHandle.pairResult.pairStatus === HIDHandle.DevicePairResult.Fail) {
              commit('SET_PAIRING', false)
              commit('SET_ERROR', 'Pairing failed')
              return false
            }
            return null
          }
          
          return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
              const result = checkPairStatus()
              if (result !== null) {
                clearInterval(interval)
                clearTimeout(timeout)
                if (result) {
                  resolve(true)
                } else {
                  reject(new Error('Pairing failed'))
                }
              }
            }, 1000)
            
            // Timeout after 30 seconds
            const timeout = setTimeout(() => {
              clearInterval(interval)
              commit('SET_PAIRING', false)
              reject(new Error('Pairing timeout'))
            }, 30000)
          })
        }
      }
    } catch (error) {
      commit('SET_PAIRING', false)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // Update battery status
  updateBattery({ commit }, battery) {
    commit('SET_BATTERY', battery)
  },

  // Save device connection to Firestore
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

  // Save device settings to Firestore
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

  // Load device settings from Firestore
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