import { firebase, database, GeoPoint, GeoFire } from './firestore'
const userListRef = database.ref('presence')
const geoPresenceRef = new GeoFire(userListRef)
const AuthModule = {
  state: {
    position: null,
    realtimePresence: null,
    listeningRadius: 1
  },
  getters: {
    position: state => state.position,
    listeningRadius: state => state.listeningRadius
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
    },
    setListeningDistance (state, listeningRadius) {
      state.listeningRadius = listeningRadius
    }
  },
  actions: {
    getListeningRadius ({ state, commit }) {
      const position = state.position
      const getMaxDistance = (activeUsers) => {
        const values = Object.values(activeUsers).sort()
        console.log(values)
        return values[19] || 10000
      }
      const activeUsers = {}
      let listeningRadius = 1
      return new Promise(resolve => {
        const geoQuery = geoPresenceRef.query({
          center: [position.latitude, position.longitude],
          radius: listeningRadius
        })
        geoQuery.on('key_entered', function (key, location, distance) {
          activeUsers[key] = distance
          if (activeUsers.length >= 20) {
            const maxDistance = getMaxDistance(activeUsers)
            console.log(maxDistance)
            commit('setListeningDistance', maxDistance)
            resolve(maxDistance)
          }
        })
        geoQuery.on('key_exited', function (key, location, distance) {
          delete activeUsers[key]
        })
        geoQuery.on('ready', function () {
          if (activeUsers.length <= 20 && listeningRadius <= 8192) {
            /* up to 20 people and 1 << 13 */
            listeningRadius = listeningRadius << 1
            geoQuery.updateCriteria({
              center: [position.latitude, position.longitude],
              radius: listeningRadius
            })
          } else {
            const maxDistance = getMaxDistance(activeUsers)
            console.log(maxDistance)
            commit('setListeningDistance', maxDistance)
            resolve(listeningRadius)
          }
        })
      })
    },
    updateLocation ({ state }) {
      const position = state.position
      const geoPoint = new GeoPoint(position.latitude, position.longitude)
      const baseCoordinates = [position.latitude, position.longitude]
      const accuracy = position.accuracy
      geoPresenceRef.set(state.realtimePresence.key, baseCoordinates)
      state.realtimePresence.update({
        geoPoint,
        accuracy
      })
    },
    rtdb_presence ({ commit, state }, { uid }) {
      const position = state.position
      const coordinates = new GeoPoint(position.latitude, position.longitude)
      const baseCoordinates = [position.latitude, position.longitude]
      const accuracy = position.accuracy
      const realtimePresence = userListRef.push()
      const displayName = 'anonymous'
      commit('setRealtimePresence', realtimePresence)
      const isOfflineForDatabase = {
        uid,
        displayName,
        state: 'offline',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
        coordinates,
        accuracy
      }
      const isOnlineForDatabase = Object.assign({}, isOfflineForDatabase, {
        state: 'online'
      })
      database.ref('.info/connected').on('value', function (snapshot) {
        if (snapshot.val()) {
          // if we lose network then remove this user from the list
          realtimePresence
            .onDisconnect()
            .remove()
            .then(() => {
              geoPresenceRef.set(realtimePresence.key, baseCoordinates)
              realtimePresence.update(isOnlineForDatabase)
            })
        } else {
          // If we're not currently connected
          realtimePresence.update(isOfflineForDatabase)
        }
      })
    }
  }
}

export default AuthModule
