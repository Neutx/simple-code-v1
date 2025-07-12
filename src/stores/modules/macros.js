import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore'
import { db } from '@/utils/firebase'

const state = {
  macros: [],
  loading: false,
  error: null,
  syncing: false
}

const getters = {
  allMacros: state => state.macros,
  macroById: state => id => state.macros.find(macro => macro.id === id),
  macroByName: state => name => state.macros.find(macro => macro.name === name),
  macroCount: state => state.macros.length,
  isLoading: state => state.loading,
  isSyncing: state => state.syncing,
  error: state => state.error,
  hasMacros: state => state.macros.length > 0
}

const mutations = {
  SET_MACROS(state, macros) {
    state.macros = macros
  },
  ADD_MACRO(state, macro) {
    state.macros.push(macro)
  },
  UPDATE_MACRO(state, updatedMacro) {
    const index = state.macros.findIndex(macro => macro.id === updatedMacro.id)
    if (index !== -1) {
      state.macros.splice(index, 1, updatedMacro)
    }
  },
  DELETE_MACRO(state, macroId) {
    state.macros = state.macros.filter(macro => macro.id !== macroId)
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_SYNCING(state, syncing) {
    state.syncing = syncing
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // Load all macros for the current user from Firebase
  async loadMacros({ commit, rootState }) {
    if (!rootState.auth.user) {
      console.log('No user authenticated, cannot load macros')
      return
    }

    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')

    try {
      const userId = rootState.auth.user.uid
      const macrosRef = collection(db, 'users', userId, 'macros')
      const macrosQuery = query(macrosRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(macrosQuery)
      
      const macros = []
      snapshot.forEach(doc => {
        macros.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      commit('SET_MACROS', macros)
      console.log(`Loaded ${macros.length} macros from Firebase`)
      
      // Also update localStorage as backup
      localStorage.setItem('kreo_macros', JSON.stringify(macros))
      
    } catch (error) {
      console.error('Error loading macros:', error)
      commit('SET_ERROR', error.message)
      
      // Fallback to localStorage if Firebase fails
      try {
        const storedMacros = localStorage.getItem('kreo_macros')
        if (storedMacros) {
          const macros = JSON.parse(storedMacros)
          commit('SET_MACROS', macros)
          console.log('Loaded macros from localStorage as fallback')
        }
      } catch (localError) {
        console.error('Error loading macros from localStorage:', localError)
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Save a new macro to Firebase
  async saveMacro({ commit, rootState }, macroData) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to save macros')
    }

    commit('SET_SYNCING', true)
    commit('CLEAR_ERROR')

    try {
      const userId = rootState.auth.user.uid
      const macroId = macroData.id || `macro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const macroToSave = {
        id: macroId,
        name: macroData.name,
        contexts: macroData.contexts || [],
        actions: macroData.actions || [],
        cycleTimes: macroData.cycleTimes || 1,
        type: macroData.type || 'repeat',
        createdAt: macroData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: userId
      }

      const macroRef = doc(db, 'users', userId, 'macros', macroId)
      await setDoc(macroRef, macroToSave)
      
      commit('ADD_MACRO', macroToSave)
      console.log('Macro saved to Firebase:', macroToSave.name)
      
      // Also update localStorage
      const currentMacros = JSON.parse(localStorage.getItem('kreo_macros') || '[]')
      const existingIndex = currentMacros.findIndex(m => m.id === macroId)
      if (existingIndex !== -1) {
        currentMacros[existingIndex] = macroToSave
      } else {
        currentMacros.push(macroToSave)
      }
      localStorage.setItem('kreo_macros', JSON.stringify(currentMacros))
      
      return macroToSave
      
    } catch (error) {
      console.error('Error saving macro:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_SYNCING', false)
    }
  },

  // Update an existing macro in Firebase
  async updateMacro({ commit, rootState }, macroData) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to update macros')
    }

    commit('SET_SYNCING', true)
    commit('CLEAR_ERROR')

    try {
      const userId = rootState.auth.user.uid
      const macroToUpdate = {
        ...macroData,
        updatedAt: serverTimestamp(),
        userId: userId
      }

      const macroRef = doc(db, 'users', userId, 'macros', macroData.id)
      await setDoc(macroRef, macroToUpdate, { merge: true })
      
      commit('UPDATE_MACRO', macroToUpdate)
      console.log('Macro updated in Firebase:', macroToUpdate.name)
      
      // Also update localStorage
      const currentMacros = JSON.parse(localStorage.getItem('kreo_macros') || '[]')
      const existingIndex = currentMacros.findIndex(m => m.id === macroData.id)
      if (existingIndex !== -1) {
        currentMacros[existingIndex] = macroToUpdate
        localStorage.setItem('kreo_macros', JSON.stringify(currentMacros))
      }
      
      return macroToUpdate
      
    } catch (error) {
      console.error('Error updating macro:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_SYNCING', false)
    }
  },

  // Delete a macro from Firebase
  async deleteMacro({ commit, rootState }, macroId) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to delete macros')
    }

    commit('SET_SYNCING', true)
    commit('CLEAR_ERROR')

    try {
      const userId = rootState.auth.user.uid
      const macroRef = doc(db, 'users', userId, 'macros', macroId)
      await deleteDoc(macroRef)
      
      commit('DELETE_MACRO', macroId)
      console.log('Macro deleted from Firebase:', macroId)
      
      // Also update localStorage
      const currentMacros = JSON.parse(localStorage.getItem('kreo_macros') || '[]')
      const updatedMacros = currentMacros.filter(m => m.id !== macroId)
      localStorage.setItem('kreo_macros', JSON.stringify(updatedMacros))
      
    } catch (error) {
      console.error('Error deleting macro:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_SYNCING', false)
    }
  },

  // Import macros from localStorage to Firebase (for migration)
  async importMacrosFromLocalStorage({ commit, dispatch, rootState }) {
    if (!rootState.auth.user) {
      console.log('No user authenticated, cannot import macros')
      return
    }

    try {
      const storedMacros = localStorage.getItem('kreo_macros')
      if (!storedMacros) {
        console.log('No macros found in localStorage to import')
        return
      }

      const macros = JSON.parse(storedMacros)
      console.log(`Importing ${macros.length} macros from localStorage to Firebase`)
      
      for (const macro of macros) {
        // Add Firebase-specific fields if missing
        if (!macro.id) {
          macro.id = `macro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        
        try {
          await dispatch('saveMacro', macro)
        } catch (error) {
          console.error('Error importing macro:', macro.name, error)
        }
      }
      
    } catch (error) {
      console.error('Error importing macros from localStorage:', error)
      commit('SET_ERROR', error.message)
    }
  },

  // Clear all macros (for testing/reset)
  async clearAllMacros({ commit, rootState }) {
    if (!rootState.auth.user) {
      throw new Error('User must be authenticated to clear macros')
    }

    commit('SET_SYNCING', true)
    commit('CLEAR_ERROR')

    try {
      const userId = rootState.auth.user.uid
      const macrosRef = collection(db, 'users', userId, 'macros')
      const snapshot = await getDocs(macrosRef)
      
      const deletePromises = []
      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref))
      })
      
      await Promise.all(deletePromises)
      
      commit('SET_MACROS', [])
      localStorage.removeItem('kreo_macros')
      
      console.log('All macros cleared from Firebase and localStorage')
      
    } catch (error) {
      console.error('Error clearing macros:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_SYNCING', false)
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