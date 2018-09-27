<template>
  <v-layout>
    <v-text-field v-model="displayName" label="Display Name" box hide-details />
    <v-btn color="success" align-self="center" @click="setDisplayName">Set display name</v-btn>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      displayName: '',
      position: null
    }
  },
  created () {
  },
  mounted () {
    const that = this
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        that.position = position.coords
      })
    }
  },
  methods: {
    setDisplayName () {
      const displayName = this.displayName
      const position = this.position
      this.$store.dispatch('setUserRef', { displayName, position })
    }
  }
}
</script>
<style scoped>
.displayName {
  text-align: center;
  overflow: hidden;
  width: 100%;
  height: 65px;
}
</style>
