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
    userInfo: null,
    threadMessage: null,
    rightDrawer: false
  },
  getters: {
    loading: state => state.loading,
    error: state => state.error,
    locaries: state => state.locaries,
    userRef: state => state.userRef,
    rightDrawer: state => state.rightDrawer,
    threadMessage: state => state.threadMessage,
    userInfo: state => state.userInfo
  },
  mutations: {
    setLoading: (state, payload) => (state.loading = payload),
    setError: (state, payload) => (state.error = payload),
    clearError: state => (state.error = null),
    setLocaries: (state, payload) => (state.locaries = payload),
    setUserRef: (state, payload) => (state.userRef = payload),
    setUserInfo: (state, payload) => (state.userInfo = payload),
    setRightDrawer: (state, payload) => (state.rightDrawer = payload),
    setThreadsMessage: (state, payload) => (state.threadMessage = payload)
  },
  actions: {
    clearError ({ commit }) {
      commit('clearError')
    },
    getUserRef ({ commit, state }, { authUser }) {
      const { email, uid } = authUser
      const userRef = userCollection.doc(uid)
      const loggedAt = new Date()
      let displayName = null
      let photoURL = null
      userRef.collection('userLog').add({
        loggedAt
      })
      commit('setUserRef', userRef)
      userRef.get().then(doc => {
        if (doc.exists) {
          displayName = doc.get('displayName')
          photoURL = doc.get('photoURL')
          commit('setUserInfo', { displayName, photoURL })
        } else {
          const createdAt = new Date()
          displayName = authUser.displayName
          photoURL = authUser.photoURL
          commit('setUserInfo', { displayName, photoURL })
          userRef.set({ createdAt, displayName, photoURL, email })
        }
        if (state.realtimeDatabase.realtimePresence) {
          commit('update_rtdb_presence', { uid, displayName, email, photoURL })
        }
      })
    }
  }
})
