import Vue from 'vue'
import Vuex from 'vuex'
// import { firestore } from './firestore'
import realtimeDatabase from './realtimeDatabase'
import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/firestore'
const firestore = firebase.firestore()
// const db = firebase.database()
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    realtimeDatabase
  },
  state: {
    loading: false,
    error: null,
    locaries: [],
    userRef: null,
    displayName: null,
    authUser: null
  },
  mutations: {
    setLoading (state, payload) {
      state.loading = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    clearError (state) {
      state.error = null
    },
    setLocaries (state, payload) {
      state.locaries = payload
    },
    setUserRef (state, payload) {
      state.userRef = payload
    },
    setDisplayName (state, payload) {
      state.displayName = payload
    },
    setAuthUser (state, payload) {
      state.authUser = payload
    }
  },
  actions: {
    clearError ({ commit }) {
      commit('clearError')
    },
    /* always called whether displayName exists */
    getUserRef ({ commit }, { authUser }) {
      commit('setAuthUser', authUser)
      const uid = authUser.uid
      const userRef = firestore.collection('users').doc(uid)
      userRef.get().then(doc => {
        if (doc.exists) {
          const displayName = doc.get('displayName')
          commit('setUserRef', userRef)
          commit('setDisplayName', displayName)
          commit('update_rtdb_presence', { uid, displayName })
        } else {
          commit('setUserRef', null)
          commit('setDisplayName', null)
        }
      })
    },
    /* only called whether displayName doens't exist */
    setUserRef ({ commit, state, dispatch }, { displayName }) {
      const uid = state.authUser.uid
      const userData = {
        displayName
      }
      const userRef = firestore.collection('users').doc(uid)
      userRef.set(userData)
      commit('setUserRef', userRef)
      commit('setDisplayName', displayName)
      dispatch('rtdb_presence', { uid })
    }
  },
  getters: {
    loading: state => state.loading,
    error: state => state.error,
    locaries: state => state.locaries,
    userRef: state => state.userRef,
    authUser: state => state.authUser,
    displayName: state => state.displayName
  }
})
