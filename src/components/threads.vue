<template>
  <v-layout fill-height column v-if="threadMessage">
    <v-flex
      style="flex-grow: 100; max-height: calc(100vh - 5.2rem);overflow-y: auto;"
      ref="container"
    >
      <v-layout class="message" column>
        <v-flex>
          <v-layout>
            <v-flex class="photo mr-1" style="flex: 0 1 auto;">
              <img :src="threadMessage.photoURL" alt="photo" @error="imgUrlAlt">
            </v-flex>
            <v-flex class="mx-1">
              <v-layout column>
                <v-flex class="name">
                  <v-icon small>person</v-icon>
                  {{threadMessage.displayName}}
                </v-flex>
                <v-flex>
                  <v-icon small>access_time</v-icon>
                  {{threadMessage.createdAt.toDate().toDateString()}}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex class="mx-1">
              <v-layout column class="text-left">
                <v-flex>
                  <v-icon small>mouse</v-icon>
                  {{threadMessage.clickCount}}
                </v-flex>
                <v-flex>
                  <v-icon small>spellcheck</v-icon>
                  {{threadMessage.readCount}}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex class="mx-1">
              <v-layout column class="text-left">
                <v-flex>
                  <v-icon small>near_me</v-icon>
                  {{threadMessage.distance >= 1 ? `${Math.floor(threadMessage.distance)}km` : `${Math.floor(threadMessage.distance * 1000)}m`}}
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex class="body" v-html="threadMessage.body"></v-flex>
      </v-layout>
      <v-flex
        v-for="(thread, index) in threads"
        :key="index"
        class="threads"
        :class="{own: userRef && thread.userRef.id == userRef.id}"
      >
        <v-flex
          class="date"
          v-if="index === 0 || (thread[index-1] && thread.createdAt.toDate().toDateString() !== thread[index-1].createdAt.toDate().toDateString())"
        >{{thread.createdAt.toDate().toDateString()}}</v-flex>
        <div
          class="mt-2"
          v-if="threads[index-1] && ((t1, t2) => t1.getTime() - t2.getTime() > 60000 )(thread.createdAt.toDate(), threads[index-1].createdAt.toDate())"
        />
        <div
          class="displayName"
          v-if="index == 0 || (index > 0 && threads[index-1].userRef.id != thread.userRef.id)"
        >{{thread.displayName}}</div>
        <v-layout align-end>
          <v-flex class="photo">
            <img
              :src="thread.photoURL"
              alt="photo"
              @error="imgUrlAlt"
              v-if="threads[index+1] === undefined
              || (threads[index-1] && ((t1, t2) => t1.getTime() - t2.getTime() > 60000 )(thread.createdAt.toDate(), threads[index-1].createdAt.toDate()))
              || threads[index+1].userRef.id != thread.userRef.id"
            >
          </v-flex>
          <v-flex class="body" v-html="thread.body"/>
          <v-flex class="minor">
            <v-flex>
              <v-icon small>access_time</v-icon>
              {{(t => `${t.toISOString().substring(11,16)}` )(thread.createdAt.toDate())}}
            </v-flex>
            <v-flex>
              <v-icon small>near_me</v-icon>
              {{distance(thread.coordinates)}}
            </v-flex>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-flex>
    <v-flex style="flex-grow: 1">
      <v-layout style="position: relative;" v-if="userRef">
        <div style="width: calc(100% - 100px);">
          <v-textarea
            v-on:keyup.ctrl.enter="sendThreads"
            placeholder="Type here..."
            v-model="content"
            auto-grow
            rows="2"
            hide-details
            background-color="transparent"
            style="padding-left: 10px;"
            maxlength="300"
          />
        </div>
        <button type="button" class="stamp" @click="sendThreads">send</button>
      </v-layout>
      <v-layout v-else justify-center class="mt-3">
        <v-btn @click="signIn">Sign in &amp; contribute to locaries</v-btn>
      </v-layout>
    </v-flex>
  </v-layout>
</template>
<style scoped>
.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}
.photo img {
  border-radius: 20px;
  overflow: hidden;
  width: 40px;
  object-fit: contain;
}
.threads > .layout > .flex {
  flex: 0 1 auto;
}
.threads.own > .layout {
  flex-direction: row-reverse;
}
.threads.own .photo,
.threads.own .displayName {
  display: none;
}
.threads.own .body {
  background-color: orange;
}
.threads .date {
  text-align: center;
  opacity: 0.5;
}
.threads .body {
  display: inline-block;
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  word-wrap: break-word;
  margin: 3px;
  white-space: pre-wrap;
  padding: 8px;
  background-color: aliceblue;
  border-radius: 10px;
  max-width: 60%;
}
.threads .photo {
  margin-left: 3px;
  margin-right: 5px;
  width: 40px;
  display: inline-block;
  vertical-align: bottom;
}
.threads .displayName {
  margin-left: 50px;
}
.message {
  margin: 10px;
}
.message .body {
  white-space: pre-wrap;
  padding: 8px;
  background-color: darkgrey;
  border-radius: 10px;
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  word-wrap: break-word;
}
.minor {
  line-height: 1;
  margin-left: 3px;
  margin-right: 3px;
  line-height: 1;
  margin-bottom: 3px;
}
</style>

<script>
import { geoLocary, GeoPoint, GeoFirestore } from '@/store/firestore'
import errorPerson from '@/assets/baseline-person-24px.svg'
export default {
  props: ['threadMessage'],
  data () {
    return {
      content: '',
      threads: [],
      unsubscribe: null
    }
  },
  created () {
    this.threadOperation()
  },
  watch: {
    threadMessage () {
      this.unsubscribe()
      this.threadOperation()
    }
  },
  computed: {
    userRef () {
      return this.$store.getters.userRef
    }
  },
  methods: {
    sendThreads () {
      if (this.content.trim() === '') {
        return false
      }
      const store = this.$store
      const coords = this.$store.getters.position
      const message = {
        userRef: store.getters.userRef,
        displayName: store.getters.userInfo.displayName,
        coordinates: new GeoPoint(coords.latitude, coords.longitude),
        body: this.content,
        createdAt: new Date(),
        photoURL: store.getters.userInfo.photoURL,
        accuracy: coords.accuracy
      }
      let { threadCount, key } = this.threadMessage
      geoLocary.ref().doc(key).update({ 'd.threadCount': threadCount > 0 ? ++threadCount : Number(1) })
      geoLocary
        .ref()
        .doc(key)
        .collection('threads')
        .add(message)
        .then(() => {
          this.content = ''
          this.scrollToBottom()
        })
    },
    scrollToBottom () {
      this.$nextTick(() => {
        const container = this.$refs.container
        container.scrollTop = container.scrollHeight
        console.log(`.container.scrollHeight: ${container.scrollHeight}`)
      })
    },
    threadOperation () {
      this.threads = []
      this.unsubscribe = geoLocary.ref().doc(this.threadMessage.key).collection('threads').orderBy('createdAt')
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              this.threads.push(change.doc.data())
            }
            if (change.type === 'modified') {
              const id = change.doc.id
              const index = this.threads.indexOf(doc => doc.id === id)
              this.threads.splice(index, 1, change.doc.data())
            }
            if (change.type === 'removed') {
              const id = change.doc.id
              const index = this.threads.indexOf(doc => doc.id === id)
              this.threads.splice(index, 1)
            }
          })
        })
    },
    signIn () {
      document.querySelector('.firebaseui-idp-google').click()
    },
    imgUrlAlt (event) {
      console.log(errorPerson)
      event.target.src = errorPerson
    },
    distance (there) {
      const coords = this.$store.getters.position
      const here = new GeoPoint(coords.latitude, coords.longitude)
      const distance = GeoFirestore.distance(here, there)
      return distance >= 1 ? `${Math.floor(distance)}km` : `${Math.floor(distance * 1000)}m`
    }
  }
}
</script>
