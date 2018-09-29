<template>
  <v-layout column fill-height>
    <v-flex class="chat-container" style="flex-grow: 100" ref="chatContainer" v-on:scroll.passive="onScroll">
      <div v-show="loading">loading...</div>
      <div v-show="empty">no more data to fetch.</div>
      <message :messages="locaries"></message>
    </v-flex>
    <v-flex style="flex-grow: 1">
      <v-layout style="position: relative;" v-if="displayName && userRef">
        <div style="width: calc(100% - 100px);">
          <v-textarea v-on:keyup.ctrl.enter="sendMessage" placeholder="Type here..." v-model="content" auto-grow rows="2" hide-details background-color="transparent" style="padding-left: 10px;" />
        </div>
        <button type="button" class="stamp" @click="sendMessage">stamp</button>
      </v-layout>
      <v-layout v-else-if="!displayName && userRef">
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
import { firestore, geo } from '../../store/firestore'

export default {
  data () {
    return {
      content: '',
      loading: false,
      empty: false,
      locaries: [],
      position: {},
      totalChatHeight: 0
    }
  },
  components: {
    message,
    firebaseui,
    displayName
  },
  created () {
    this.loadChat()
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
    }
  },
  methods: {
    loadChat () {
      this.loading = true
      const coords = this.$store.getters.position
      const center = geo.point(coords.latitude, coords.longitude).data
      const locaries = geo.collection('locaries')
      const that = this
      // .orderBy('createdAt', 'desc')
      // .limit(15)
      const query = locaries.within(center, 0.01, 'location')
      query.subscribe(snapshot => {
        debugger
        if (!snapshot.empty) {
          snapshot.docChanges().reverse().forEach(change => {
            if (change.type === 'added') {
              that.locaries.push(change.doc.data())
              that.loading = false
            }
          })
        } else {
          that.loading = false
          that.empty = true
        }
        that.scrollToBottom()
      })
    },
    setLocation () {

    },
    watchLocation () {
      const that = this
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
          console.log(position)
          that.position = position.coords
          if (that.authUser) {
            that.$store.dispatch('updateLocation', { position: position.coords })
          }
        })
      }
    },
    sendMessage () {
      geo.collection('locaries')
        .add({
          userRef: this.$store.getters.userRef,
          displayName: this.$store.getters.displayName,
          location: geo.point(this.position.latitude, this.position.longitude).data,
          body: this.content,
          createdAt: new Date(),
          accuracy: this.position.accuracy
        })
        .then(() => { this.content = '' })
    },
    onScroll (ev) {
      const that = this
      if (ev.target.scrollTop < 1 && !this.empty) {
        this.loading = true
        firestore
          .collection('locaries')
          .orderBy('createdAt', 'desc')
          .startAfter(this.locaries[0].createdAt)
          .limit(15)
          .get()
          .then(({ docs }) => {
            if (docs.length <= 0) {
              that.empty = true
            } else {
              const more = docs.map(doc => doc.data())
              that.locaries = more.reverse().concat(that.locaries)
              // that.locaries = that.locaries.flat()
              that.scrollTo()
            }
            this.loading = false
          })
          .catch(that.loading = false)
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
  max-height: calc(100vh - 8.7rem);
}
.message {
  margin-bottom: 3px;
}
.message.own {
  text-align: right;
}
.message.own .content {
  background-color: lightskyblue;
}
.chat-container .user {
  font-size: 18px;
  font-weight: bold;
}
.chat-container .content {
  padding: 8px;
  background-color: lightgreen;
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  max-width: 50%;
  word-wrap: break-word;
}
@media (max-width: 480px) {
  .chat-container .content {
    max-width: 60%;
  }
}
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
