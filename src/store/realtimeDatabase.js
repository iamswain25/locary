import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/firestore'
// const firestore = firebase.firestore()
const db = firebase.database()

const AuthModule = {
  state: {
    position: null,
    realtimePresence: null
  },
  mutations: {
    setPosition (state, position) {
      state.position = position
    },
    setRealtimePresence (state, realtimePresence) {
      state.realtimePresence = realtimePresence
    }
  },
  actions: {
    updateLocation ({ commit, state }, { position }) {
      if (position) {
        commit('setPosition', position)
      } else {
        position = state.position
      }
      const geoPoint = new firebase.firestore.GeoPoint(
        position.latitude,
        position.longitude
      )
      const accuracy = position.accuracy
      state.realtimePresence.update({
        geoPoint,
        accuracy
      })
    },
    rtdb_presence ({ commit, state }, { uid }) {
      const position = state.position
      const geoPoint = new firebase.firestore.GeoPoint(position.latitude, position.longitude)
      const accuracy = position.accuracy
      const userListRef = db.ref('presence')
      const realtimePresence = userListRef.push()
      commit('setRealtimePresence', realtimePresence)
      // We'll create two constants which we will write to
      // the Realtime database when this device is offline
      // or online.
      const isOfflineForDatabase = {
        uid,
        state: 'offline',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        geoPoint,
        accuracy
      }
      const isOnlineForDatabase = {
        uid,
        state: 'online',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        geoPoint,
        accuracy
      }
      // Create a reference to the special '.info/connected' path in
      // Realtime Database. This path returns `true` when connected
      // and `false` when disconnected.
      db.ref('.info/connected').on('value', function (snapshot) {
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
