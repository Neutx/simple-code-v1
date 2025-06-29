import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/utils/firebase'

const state = {
  user: null,
  userProfile: null,
  loading: false,
  error: null,
  initialized: false
}

const getters = {
  isAuthenticated: state => !!state.user,
  currentUser: state => state.user,
  userProfile: state => state.userProfile,
  loading: state => state.loading,
  error: state => state.error,
  initialized: state => state.initialized
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.initialized = true
  },
  SET_USER_PROFILE(state, profile) {
    state.userProfile = profile
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  },
  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized
  }
}

const actions = {
  // Email/Password Login
  async login({ commit }, { email, password }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const auth = getAuth()
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Google Sign In
  async loginWithGoogle({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Register
  async register({ commit }, { email, password, displayName }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const auth = getAuth()
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Logout
  async logout({ commit }) {
    try {
      const auth = getAuth()
      await signOut(auth)
      commit('SET_USER', null)
      commit('SET_USER_PROFILE', null)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
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