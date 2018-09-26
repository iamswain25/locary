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
    getUserRef ({ commit, dispatch }, { authUser, position }) {
      commit('setAuthUser', authUser)
      commit('setPosition', position)
      const uid = authUser.uid
      const userRef = firestore.collection('users').doc(uid)
      userRef.get().then(doc => {
        if (doc.exists) {
          commit('setUserRef', userRef)
          commit('setDisplayName', doc.get('displayName'))
          dispatch('rtdb_presence', { uid })
        } else {
          commit('setUserRef', null)
          commit('setDisplayName', null)
        }
      })
    },
    setUserRef ({ commit, state, dispatch }, { displayName, position }) {
      commit('setPosition', position)
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
