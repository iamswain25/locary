<template>
  <transition-group name="list">
    <div class="message" v-for="(message,index) in messages" :key="index" :class="{own: message.userRef.id == userRef.id}">
      <v-flex class="date" v-if="index === 0 || message.createdAt.toDate().toDateString() !== messages[index-1].createdAt.toDate().toDateString()">
        {{message.createdAt.toDate().toDateString()}}
      </v-flex>
      <div class="user" v-if="index > 0 && messages[index-1].userRef.id != message.userRef.id">{{ message.displayName }}</div>
      <div class="user" v-if="index == 0">{{ message.displayName }}</div>
      <div style="margin-top: 5px"></div>
      <v-layout align-end @click="openThreads">
        <v-flex class="content">
          <div v-html="message.body"></div>
        </v-flex>
        <v-flex class="time">
          <v-flex>{{(t => `${t.toISOString().substring(11,16)}` )(message.createdAt.toDate())}}</v-flex>
          <v-flex v-if="!loading" v-observe-visibility="{
              callback: (isVisible) => visibilityChanged(isVisible, message),
              throttle: 300
            }">{{ message.readCount || 0 }} read</v-flex>
        </v-flex>
      </v-layout>
    </div>
  </transition-group>
</template>

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
    openThreads () {
      this.$store.commit('setRightDrawer', true)
    }
  }
}
</script>

<style scoped>
.time {
  flex: 0 1 auto;
  margin-left: 10px;
  margin-right: 10px;
  line-height: 1;
  margin-bottom: 3px;
}
.date {
  background-color: fuchsia;
  text-align: center;
}
.content {
  flex: 0 1 auto;
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
.chat-container .user {
  font-size: 18px;
  font-weight: bold;
}
.chat-container .content {
  white-space: pre-wrap;
  padding: 8px;
  background-color: aliceblue;
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  max-width: 80%;
  word-wrap: break-word;
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
