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
  methods: {
    setDisplayName () {
      const displayName = this.displayName
      const createdAt = new Date()
      this.$store.dispatch('setUserRef', { displayName, createdAt })
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
