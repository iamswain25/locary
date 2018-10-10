import { firebase, database, GeoPoint, GeoFire } from './firestore'
const userListRef = database.ref('presence')
const geoPresenceRef = new GeoFire(userListRef)
const MAX_RADIUS = 1 << 14 // 14
const MIN_RADIUS = 1 // km
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
        const maxDistance =
          typeof values[MAX_FRIENDS - 1] !== 'undefined'
            ? values[MAX_FRIENDS - 1] < MIN_RADIUS
              ? MIN_RADIUS
              : values[MAX_FRIENDS - 1]
            : values.length === 0
              ? MAX_RADIUS
              : values.slice(-1)[0] < MIN_RADIUS
                ? MIN_RADIUS
                : values.slice(-1)[0]
        const listeningUser = values.filter(d => d <= maxDistance)
        commit('setListeningUserCount', listeningUser.length)
        commit('setListeningDistance', maxDistance)
        console.log(`radius: ${maxDistance}km, users: ${listeningUser.length}`)
        return maxDistance
      }
      const activeUsers = {}
      let listeningRadius = 1
      return new Promise(resolve => {
        const geoQuery = geoPresenceRef.query({
          center: [position.latitude, position.longitude],
          radius: listeningRadius
        })
        let readyFiredOnce = false
        geoQuery.on('key_entered', function (key, location, distance) {
          if (state.realtimePresence.key !== key) {
            /** myself excluded */
            activeUsers[key] = distance
          }
          if (readyFiredOnce) {
            listeningRadius = getMaxDistance(activeUsers)
          }
        })
        geoQuery.on('key_exited', function (key, location, distance) {
          delete activeUsers[key]
          if (distance <= listeningRadius && readyFiredOnce) {
            listeningRadius = getMaxDistance(activeUsers)
          }
        })
        geoQuery.on('ready', function () {
          if (
            Object.keys(activeUsers).length < MAX_FRIENDS &&
            listeningRadius < MAX_RADIUS
          ) {
            /* double each updateCriteria */
            listeningRadius = listeningRadius << 1
            geoQuery.updateCriteria({
              center: [position.latitude, position.longitude],
              radius: listeningRadius
            })
          } else {
            readyFiredOnce = true
            const listeningRadius = getMaxDistance(activeUsers)
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
