import Vue from 'vue'
import Vuex from 'vuex'
import { userCollection } from './firestore'
import realtimeDatabase from './realtimeDatabase'
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
    authUser: null,
    rightDrawer: false
  },
  getters: {
    loading: state => state.loading,
    error: state => state.error,
    locaries: state => state.locaries,
    userRef: state => state.userRef,
    authUser: state => state.authUser,
    rightDrawer: state => state.rightDrawer,
    displayName: state => state.displayName
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
    },
    setRightDrawer: (state, payload) => (state.rightDrawer = payload)
  },
  actions: {
    clearError ({ commit }) {
      commit('clearError')
    },
    /* always called whether displayName exists */
    getUserRef ({ commit }, { authUser }) {
      commit('setAuthUser', authUser)
      const uid = authUser.uid
      const userRef = userCollection.doc(uid)
      userRef.get().then(doc => {
        if (doc.exists) {
          const displayName = doc.get('displayName')
          const loggedAt = new Date()
          userRef.collection('userLog').add({
            loggedAt
          })
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
    setUserRef ({ commit, state, dispatch }, userData) {
      const uid = state.authUser.uid
      const userRef = userCollection.doc(uid)
      userRef.set(userData)
      const loggedAt = new Date()
      userRef.collection('userLog').add({
        loggedAt
      })
      commit('setUserRef', userRef)
      commit('setDisplayName', userData.displayName)
      dispatch('rtdb_presence', { uid })
    }
  }
})
