import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
  error: null
}

const getters = {
  isAuthenticated: state => !!state.user,
  currentUser: state => state.user,
  userProfile: state => state.userProfile,
  loading: state => state.loading,
  error: state => state.error
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
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
  }
}

const actions = {
  // Initialize auth state listener
  initAuth({ commit, dispatch }) {
    commit('SET_LOADING', true)
    const auth = getAuth()
    
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            commit('SET_USER', {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            })
            
            // Fetch user profile from Firestore (non-blocking)
            dispatch('fetchUserProfile', user.uid).catch(console.error)
          } else {
            commit('SET_USER', null)
            commit('SET_USER_PROFILE', null)
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          commit('SET_ERROR', error.message)
        } finally {
          commit('SET_LOADING', false)
          resolve(user)
          // Unsubscribe after first auth state change to avoid memory leaks
          unsubscribe()
        }
      })
      
      // Fallback timeout to prevent infinite loading
      setTimeout(() => {
        commit('SET_LOADING', false)
        resolve(null)
        unsubscribe()
      }, 5000)
    })
  },

  // Email/Password Login
  async login({ commit }, { email, password, rememberMe }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const auth = getAuth()
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
      
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Google Sign In
  async loginWithGoogle({ commit, dispatch }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      
      // Create user profile if it doesn't exist (non-blocking)
      dispatch('createUserProfile', user).catch(console.error)
      
      return user
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Register
  async register({ commit, dispatch }, { email, password, displayName }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      const auth = getAuth()
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile (non-blocking)
      dispatch('createUserProfile', { ...user, displayName }).catch(console.error)
      
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
      localStorage.removeItem('rememberMe')
      commit('SET_USER', null)
      commit('SET_USER_PROFILE', null)
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // Create user profile in Firestore
  async createUserProfile({ commit }, user) {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          settings: {
            theme: 'dark',
            notifications: true
          },
          devices: []
        }
        
        await setDoc(userRef, userData)
        commit('SET_USER_PROFILE', userData)
      } else {
        // Update last login time
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true })
        commit('SET_USER_PROFILE', userDoc.data())
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      commit('SET_ERROR', error.message)
    }
  },

  // Fetch user profile
  async fetchUserProfile({ commit }, uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        commit('SET_USER_PROFILE', userDoc.data())
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      commit('SET_ERROR', error.message)
    }
  },

  // Update user profile
  async updateUserProfile({ commit, state }, updates) {
    try {
      const userRef = doc(db, 'users', state.user.uid)
      await setDoc(userRef, updates, { merge: true })
      
      commit('SET_USER_PROFILE', { ...state.userProfile, ...updates })
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