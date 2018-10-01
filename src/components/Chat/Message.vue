<template>
  <div>
    <div class="message" v-for="(message,index) in messages" :key="index" :class="{own: message.userRef.id == userRef.id}">
      <div class="user" v-if="index>0 && messages[index-1].userRef.id != message.userRef.id">{{ message.displayName }}</div>
      <div class="user" v-if="index == 0">{{ message.displayName }}</div>
      <div style="margin-top: 5px"></div>
      <span class="time">{{((t) => `${t.getHours()}:${t.getMinutes()}` )(message.createdAt.toDate())}}</span>
      <div class="content">
        <div v-html="message.body"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Timestamp } from '../../store/firestore'
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
    }
  },
  methods: {
    timestamp (seconds) {
      return new Timestamp(seconds)
    }
  }
}
</script>

<style>
span.emoji {
  font-size: 20px;
  vertical-align: middle;
  line-height: 2;
}
</style>
