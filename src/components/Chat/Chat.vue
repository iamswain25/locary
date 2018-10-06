<template>
  <v-layout column fill-height>
    <v-flex class="chat-container" style="flex-grow: 100" ref="chatContainer">
      <div v-show="empty">no more data to fetch.</div>
      <div v-show="loading">loading...</div>
      <message :messages="locaries"></message>
    </v-flex>
    <v-flex style="flex-grow: 1">
      <v-layout style="position: relative;" v-if="displayName !== null && userRef !== null">
        <div style="width: calc(100% - 100px);">
          <v-textarea v-on:keyup.ctrl.enter="sendMessage" placeholder="Type here..." v-model="content" auto-grow rows="2" hide-details background-color="transparent" style="padding-left: 10px;" />
        </div>
        <button type="button" class="stamp" @click="sendMessage">stamp</button>
      </v-layout>
      <v-layout v-else-if="displayName === null && authUser !== null">
        <displayName />
      </v-layout>
      <v-layout v-else>
        <firebaseui />
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import message from './Message.vue'
import firebaseui from '../Auth/firebaseui'
import displayName from '../Auth/displayName'
import { geoLocary, GeoPoint } from '../../store/firestore'
import uuidV4 from 'uuid/v4'

export default {
  data () {
    return {
      content: '',
      loading: false,
      empty: true,
      locaries: [],
      totalChatHeight: 0,
      geoQuery: null,
      queryLimit: 5
    }
  },
  components: {
    message,
    firebaseui,
    displayName
  },
  mounted () {
    this.loading = true
    const store = this.$store
    const authUser = this.authUser
    const uid = (authUser) ? authUser.uid : uuidV4()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        store.commit('setPosition', position.coords)
        store.dispatch('rtdb_presence', { uid })
        store.dispatch('getListeningRadius')
          .then(this.loadChat)
        // this.loadChat()
      })
    }
  },
  computed: {
    userRef () {
      return this.$store.getters.userRef
    },
    authUser () {
      return this.$store.getters.authUser
    },
    displayName () {
      return this.$store.getters.displayName
    },
    radius () {
      return this.$store.getters.listeningRadius
    }
  },
  methods: {
    loadChat () {
      const that = this
      this.loading = true
      const coords = this.$store.getters.position
      const radius = this.radius
      const center = new GeoPoint(coords.latitude, coords.longitude)
      // const query = ref => ref.limit(this.queryLimit) // limit(8) .orderBy('d.createdAt', 'desc')
      const geoQuery = geoLocary.query({ center, radius })
      this.geoQuery = geoQuery
      geoQuery.on('ready', function () {
        that.locaries.sort((a, b) => (a.createdAt.toMillis() >= b.createdAt.toMillis()) ? 1 : -1)
        that.loading = false
        that.scrollToBottom()
      })
      geoQuery.on('key_entered', function (key, doc, distance) {
        doc.distance = distance
        that.locaries.push(doc)
      })
      this.watchLocation()
    },
    updateLocaries () {
      const coords = this.$store.getters.position
      const radius = this.radius
      const center = new GeoPoint(coords.latitude, coords.longitude)
      this.geoQuery.updateCriteria({ center, radius })
    },
    watchLocation () {
      const that = this
      const store = this.$store
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
          console.log(position)
          store.commit('setPosition', position.coords)
          store.dispatch('updateLocation')
          that.updateLocaries()
        })
      }
    },
    sendMessage () {
      const store = this.$store
      const coords = this.$store.getters.position
      geoLocary
        .add({
          userRef: store.getters.userRef,
          displayName: store.getters.displayName,
          coordinates: new GeoPoint(coords.latitude, coords.longitude),
          body: this.content,
          createdAt: new Date(),
          accuracy: coords.accuracy
        })
        .then((docRef) => {
          console.log(docRef)
          this.content = ''
        })
    },
    onScroll (ev) {
      const that = this
      if (ev.target.scrollTop < 1 && !this.empty) {
        this.loading = true
        this.queryLimit += 5
        const query = ref => ref.limit(this.queryLimit) // limit(8) .orderBy('d.createdAt', 'desc')
        this.geoQuery.updateCriteria({ query })
        this.geoQuery.on('ready', function () {
          that.locaries.sort((a, b) => a.createdAt.toMillis() > b.createdAt.toMillis())
          that.loading = false
          that.scrollTo()
        })
      }
    },
    scrollTo () {
      this.$nextTick(() => {
        let currentHeight = this.$refs.chatContainer.scrollHeight
        let difference = currentHeight - this.totalChatHeight
        const container = this.$el.querySelector('.chat-container')
        container.scrollTop = difference
        this.totalChatHeight = currentHeight
      })
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.chat-container')
        container.scrollTop = container.scrollHeight
        this.totalChatHeight = this.$refs.chatContainer.scrollHeight
      })
    }
  },
  destroyed () {
    // window.removeEventListener('scroll', this.onScroll)
  },
  watch: {
    radius () {
      if (this.geoQuery !== null) {
        this.updateLocaries()
      }
    }
  }
}
</script>

<style>
.scrollable {
  overflow-y: auto;
  height: 90vh;
}

.chat-container {
  box-sizing: border-box;
  overflow-y: auto;
  padding: 10px;
  background-color: #f2f2f2;
  max-height: calc(100vh - 9.2rem);
}
.message {
  margin-bottom: 3px;
}
.message.own {
  text-align: right;
}
.message.own .content {
  background-color: orange;
}
.chat-container .user {
  font-size: 18px;
  font-weight: bold;
}
.chat-container .content {
  padding: 8px;
  background-color: aliceblue;
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  max-width: 80%;
  word-wrap: break-word;
}
/* @media (max-width: 480px) {
  .chat-container .content {
    max-width: 80%;
  }
} */
.stamp {
  font-size: 16px;
  align-self: center;
  position: absolute;
  height: 100%;
  margin: 0;
  right: 0;
  padding: 0;
  background-color: #1976d2;
  width: 88px;
  color: white;
  box-sizing: border-box;
  /* border-radius: 10px; */
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
}
</style>
