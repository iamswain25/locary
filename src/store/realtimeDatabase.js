import { firebase, database, GeoPoint, GeoFire } from './firestore'
const userListRef = database.ref('presence')
const geoPresenceRef = new GeoFire(userListRef)
const MAX_RADIUS = 1 << 14 // 14
const MAX_FRIENDS = 3
const onlineStatus = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP
}

const AuthModule = {
  state: {
    position: null,
    realtimePresence: null,
    listeningRadius: 1,
    listeningUserCount: 1
  },
  getters: {
    position: state => state.position,
    listeningRadius: state => state.listeningRadius,
    listeningUserCount: state => state.listeningUserCount
  },
  mutations: {
    update_rtdb_presence (state, payload) {
      Object.assign(onlineStatus, payload)
      state.realtimePresence.update(payload)
    },
    setPosition (state, position) {
      state.position = position
    },
    setRealtimePresence (state, realtimePresence) {
      state.realtimePresence = realtimePresence
    },
    setListeningUserCount (state, listeningUserCount) {
      state.listeningUserCount = listeningUserCount
    },
    setListeningDistance (state, listeningRadius) {
      state.listeningRadius = listeningRadius
    }
  },
  actions: {
    getListeningRadius ({ state, commit }) {
      const position = state.position
      const getMaxDistance = activeUsers => {
        const values = Object.values(activeUsers).sort()
        console.log(values)
        return values[MAX_FRIENDS - 1] || MAX_RADIUS
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
          commit('setListeningUserCount', activeUsers.length < MAX_FRIENDS ? activeUsers.length : MAX_FRIENDS)
          if (activeUsers.length >= MAX_FRIENDS) {
            const maxDistance = getMaxDistance(activeUsers)
            console.log(maxDistance)
            commit('setListeningDistance', maxDistance)
            resolve(maxDistance)
          }
        })
        geoQuery.on('key_exited', function (key, location, distance) {
          delete activeUsers[key]
          commit('setListeningUserCount', activeUsers.length < MAX_FRIENDS ? activeUsers.length : MAX_FRIENDS)
        })
        geoQuery.on('ready', function () {
          if (activeUsers.length <= MAX_FRIENDS && listeningRadius <= MAX_RADIUS) {
            /* double each updateCriteria */
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
      const coordinates = new GeoPoint(position.latitude, position.longitude)
      const baseCoordinates = [position.latitude, position.longitude]
      const accuracy = position.accuracy
      geoPresenceRef.set(state.realtimePresence.key, baseCoordinates)
      Object.assign(onlineStatus, {
        coordinates,
        accuracy
      })
      state.realtimePresence.update(onlineStatus)
    },
    rtdb_presence ({ commit, state }, { uid }) {
      const position = state.position
      const coordinates = new GeoPoint(position.latitude, position.longitude)
      const baseCoordinates = [position.latitude, position.longitude]
      const accuracy = position.accuracy
      Object.assign(onlineStatus, {
        coordinates,
        accuracy,
        uid
      })
      const realtimePresence = userListRef.push()
      commit('setRealtimePresence', realtimePresence)
      database.ref('.info/connected').on('value', function (snapshot) {
        if (snapshot.val()) {
          // if we lose network then remove this user from the list
          realtimePresence
            .onDisconnect()
            .remove()
            .then(geoPresenceRef.set(realtimePresence.key, baseCoordinates))
            .then(realtimePresence.update(onlineStatus))
        } else {
          // If we're not currently connected
          const offlineStatus = { ...onlineStatus, state: 'offline' }
          realtimePresence.update(offlineStatus)
        }
      })
    }
  }
}

export default AuthModule
