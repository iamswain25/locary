import { firebase, database, GeoPoint } from './firestore'

const AuthModule = {
  state: {
    position: null,
    realtimePresence: null
  },
  getters: {
    position: state => state.position
  },
  mutations: {
    update_rtdb_presence (state, payload) {
      state.realtimePresence.update(payload)
    },
    setPosition (state, position) {
      state.position = position
    },
    setRealtimePresence (state, realtimePresence) {
      state.realtimePresence = realtimePresence
    }
  },
  actions: {
    updateLocation ({ state }) {
      const position = state.position
      const geoPoint = new GeoPoint(position.latitude, position.longitude)
      const accuracy = position.accuracy
      state.realtimePresence.update({
        geoPoint,
        accuracy
      })
    },
    rtdb_presence ({ commit, state }, { uid }) {
      const position = state.position
      const geoPoint = new GeoPoint(position.latitude, position.longitude)
      const accuracy = position.accuracy
      const userListRef = database.ref('presence')
      const realtimePresence = userListRef.push()
      const displayName = 'anonymous'
      commit('setRealtimePresence', realtimePresence)
      // We'll create two constants which we will write to
      // the Realtime database when this device is offline
      // or online.
      const isOfflineForDatabase = {
        uid,
        displayName,
        state: 'offline',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        geoPoint,
        accuracy
      }
      const isOnlineForDatabase = {
        uid,
        displayName,
        state: 'online',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        geoPoint,
        accuracy
      }
      // Create a reference to the special '.info/connected' path in
      // Realtime Database. This path returns `true` when connected
      // and `false` when disconnected.
      database.ref('.info/connected').on('value', function (snapshot) {
        if (snapshot.val()) {
          // if we lose network then remove this user from the list
          realtimePresence.onDisconnect().remove()
          realtimePresence.set(isOnlineForDatabase)
        } else {
          // If we're not currently connected
          realtimePresence.set(isOfflineForDatabase)
        }
      })
    }
  }
}

export default AuthModule
