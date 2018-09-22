import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    loading: false,
    error: null,
    locaries: [],
    userId: null,
    user: {}
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
    setUserId (state, payload) {
      state.userId = payload
    },
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    clearError ({ commit }) {
      commit('clearError')
    }
  },
  getters: {
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    },
    locaries (state) {
      return state.locaries
    },
    userId (state) {
      return state.userId
    },
    user (state) {
      return state.user
    }
  }
})
