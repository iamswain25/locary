<template>
  <v-layout column fill-height>
    <v-flex class="chat-container" style="flex-grow: 100" ref="chatContainer" v-on:scroll.passive="onScroll" @click="onScroll">
      <div v-show="loading">loading...</div>
      <div v-show="empty">no more data to fetch.</div>
      <message :messages="locaries"></message>
    </v-flex>
    <v-flex style="flex-grow: 1">
      <v-layout style="position: relative;" v-if="userId">
        <div style="width: calc(100% - 100px);">
          <v-textarea v-on:keyup.ctrl.enter="sendMessage" placeholder="Type here..." v-model="content" auto-grow rows="2" hide-details background-color="transparent" style="padding-left: 10px;" />
        </div>
        <button type="button" class="stamp" @click="sendMessage">stamp</button>
      </v-layout>
      <v-layout v-else>
        <firebaseui></firebaseui>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
  import message from './Message.vue'
  import firebaseui from '../Auth/firebaseui'
  import { firestore, firebase } from '../../store/firestore'
  export default {
    data () {
      return {
        content: '',
        loading: false,
        empty: false,
        locaries: [],
        position: {}
      }
    },
    firestore: {
    },
    mounted () {
      this.loadChat()
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.position = position.coords
        })
      }
    },
    components: {
      message,
      firebaseui
    },
    created () {
      // window.addEventListener('scroll', this.onScroll)
    },
    computed: {
      userId () {
        return this.$store.getters.userId
      }
    },
    methods: {
      loadChat () {
        this.loading = true
        const that = this
        // this.$firestoreRefs.locaries
        firestore
          .collection('locaries')
          .orderBy('createdAt', 'desc')
          .limit(5)
          .onSnapshot(snapshot => {
            if (snapshot) {
              snapshot.docChanges().reverse().forEach(change => {
                if (change.type === 'added') {
                  that.locaries.push(change.doc.data())
                  that.loading = false
                }
              })
            } else {
              that.loading = false
            }
          })
      },
      sendMessage () {
        firestore
          .collection('locaries')
          .add({
            userId: this.$store.getters.user.uid,
            location: new firebase.firestore.GeoPoint(this.position.latitude, this.position.longitude),
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
            .limit(5)
            .get()
            .then(({docs}) => {
              if (docs.length <= 0) {
                that.empty = true
              } else {
                const more = docs.map(doc => doc.data())
                that.locaries = more.reverse().concat(that.locaries)
                // that.locaries = that.locaries.flat()
              }
              this.loading = false
            })
            .catch(that.loading = false)
        }
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
