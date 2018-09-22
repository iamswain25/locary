<template>
  <div>
    <div class="message" v-for="(message,index) in messages" :key="index" :class="{own: message.userId == userId}">
      <div class="user" v-if="index>0 && messages[index-1].userId != message.userId">{{message.userId}}</div>
      <div class="user" v-if="index == 0">{{message.userId}}</div>
      <div style="margin-top: 5px"></div>
      <div class="content">
        <div v-html="message.body"></div>
        <chat-image v-if="message.image" :imgsrc="message.image" @imageLoad="imageLoad"></chat-image>
      </div>
    </div>
  </div>
</template>

<script>
  import Image from './Image.vue'

  export default {
    data () {
      return {}
    },
    props: [
      'messages'
    ],
    components: {
      'chat-image': Image
    },
    computed: {
      userId () {
        return this.$store.getters.userId
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
