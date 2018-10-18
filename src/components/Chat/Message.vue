<template>
  <transition-group name="list">
    <div
      class="message"
      v-for="(message,index) in messages"
      :key="index"
      :class="{own: message.userRef.id == userRef.id}"
    >
      <v-flex
        class="date"
        v-if="index === 0 || message.createdAt.toDate().toDateString() !== messages[index-1].createdAt.toDate().toDateString()"
      >{{message.createdAt.toDate().toDateString()}}</v-flex>
      <div
        class="mt-2"
        v-if="(messages[index-1] && ((t1, t2) => t1.getTime() - t2.getTime() > 60000 )(message.createdAt.toDate(), messages[index-1].createdAt.toDate()))"
      />
      <div
        class="user"
        v-if="index == 0 || (index > 0 && messages[index-1].userRef.id != message.userRef.id)"
      >{{ message.displayName }}</div>
      <v-layout align-end @click="openThreads(message)">
        <v-flex class="photo">
          <img
            :src="message.photoURL"
            alt="photo"
            v-if="messages[index+1] === undefined
              || (messages[index-1] && ((t1, t2) => t1.getTime() - t2.getTime() > 60000 )(message.createdAt.toDate(), messages[index-1].createdAt.toDate()))
              || messages[index+1].userRef.id != message.userRef.id"
          >
        </v-flex>
        <v-flex class="content">
          <div
            v-html="message.body.length < 120 ? message.body : message.body.slice(0, 120) + ' ......'"
          ></div>
        </v-flex>
        <v-flex
          class="minor"
          v-if="!loading"
          v-observe-visibility="{
            callback: (isVisible) => visibilityChanged(isVisible, message),
            throttle: 300
          }"
        >
          <!-- time -->
          <!-- <v-flex>
            <v-icon small>access_time</v-icon>
            {{(t => `${t.toISOString().substring(11,16)}` )(message.createdAt.toDate())}}
          </v-flex>-->
          <!-- readCount -->
          <!-- <v-flex
            v-if="!loading"
            v-observe-visibility="{
              callback: (isVisible) => visibilityChanged(isVisible, message),
              throttle: 300
            }"
          >{{ message.readCount || 0 }} read</v-flex>-->

          <v-flex class="threadCount" v-if="message.threadCount > 0">
            <v-icon small>list</v-icon>
            {{message.threadCount}}
          </v-flex>
          <v-flex class="distance">
            <v-icon small>near_me</v-icon>
            {{message.distance >= 1 ? `${Math.floor(message.distance)}km` : `${Math.floor(message.distance * 1000)}m` }}
          </v-flex>
        </v-flex>
      </v-layout>
    </div>
  </transition-group>
</template>

<style scoped>
.minor {
  flex: 0 1 auto;
  margin-left: 10px;
  margin-right: 10px;
  line-height: 1;
  margin-bottom: 3px;
  text-align: left;
}
.date {
  /* background-color: fuchsia; */
  text-align: center;
  opacity: 0.5;
}
.content,
.photo {
  flex: 0 1 auto;
}
.photo {
  margin-right: 5px;
  width: 40px;
}
.photo img {
  border-radius: 20px;
  overflow: hidden;
  width: 40px;
  vertical-align: bottom;
  object-fit: contain;
}
.message {
  margin-bottom: 3px;
}
.message.own {
  text-align: right;
}
.message.own .layout {
  /* justify-content: flex-end; */
  flex-direction: row-reverse;
}
.message.own .content {
  background-color: orange;
}
.message.own .user,
.message.own .photo {
  display: none;
}
.chat-container .user {
  font-size: 12px;
  margin-left: 50px;
  /* font-weight: bold; */
}
.chat-container .content {
  white-space: pre-wrap;
  padding: 8px;
  background-color: aliceblue;
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  max-width: 70%;
  word-wrap: break-word;
  max-height: 120px;
  text-align: left;
  overflow: hidden;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(100px);
}
</style>

<script>
import { Timestamp, geoLocary } from '../../store/firestore'
export default {
  data () {
    return {}
  },
  props: [
    'messages'
  ],
  components: {
  },
  computed: {
    userRef () {
      return this.$store.getters.userRef || {}
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  methods: {
    timestamp (seconds) {
      return new Timestamp(seconds)
    },
    visibilityChanged (isVisible, message) {
      if (isVisible && !message.isRead) {
        // console.log(`isVisible: ${isVisible} key: ${message.key}`)
        let { readCount, key } = message
        message.readCount++
        message.isRead = true
        geoLocary.ref().doc(key).update({ 'd.readCount': readCount > 0 ? ++readCount : Number(1) })
        // geoLocary.ref()
      }
    },
    openThreads (message) {
      let { clickCount, key } = message
      geoLocary.ref().doc(key).update({ 'd.clickCount': clickCount > 0 ? ++clickCount : Number(1) })
      this.$store.commit('setThreadsMessage', message)
      this.$store.commit('setRightDrawer', true)
    }
  }
}
</script>
