<template>
  <div>
    <div class="message" v-for="(message,index) in messages" :key="index" :class="{own: message.userRef.id == userRef.id}">
      <div class="user" v-if="index>0 && messages[index-1].userRef.id != message.userRef.id">{{ message.displayName }}</div>
      <div class="user" v-if="index == 0">{{ message.displayName }}</div>
      <div style="margin-top: 5px"></div>
      <div class="content">
        <div v-html="message.body"></div>
        <chatImage v-if="message.image" :imgsrc="message.image" @imageLoad="imageLoad" />
      </div>
    </div>
  </div>
</template>

<script>
import chatImage from './chatImage.vue'
export default {
  data () {
    return {}
  },
  props: [
    'messages'
  ],
  components: {
    chatImage
  },
  computed: {
    userRef () {
      return this.$store.getters.userRef || {}
    }
  },
  methods: {
    imageLoad () {
      // this.$emit('imageLoad')
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
